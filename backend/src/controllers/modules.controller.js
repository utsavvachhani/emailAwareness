import pool from "../config/database.js";
import { deleteFromCloudinary } from "../utils/cloudinary.js";


// ─── ADMIN: Get modules for a course ─────────────────────────────────────────
export const getCourseModules = async (req, res) => {
  const { course_id } = req.params;
  try {
    const courseRes = await pool.query(
      `SELECT c.id FROM courses c 
       JOIN companies comp ON c.company_id = comp.id
       WHERE c.id = $1 AND (comp.admin_id = $2 OR $3 = 'superadmin')`,
      [course_id, req.user.id, req.user.role]
    );

    if (courseRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Course not found or unauthorized" });
    }

    const result = await pool.query(
      `SELECT m.*, 
              d.contentextra as doc_content, d.image_url,
              v.video_url
       FROM course_modules m
       LEFT JOIN course_modules_docs d ON m.id = d.course_module_id AND m.type = 'docs'
       LEFT JOIN course_modules_video v ON m.id = v.course_module_id AND m.type = 'video'
       WHERE m.course_id = $1 
       ORDER BY m.order_index ASC, m.created_at ASC`,
      [course_id]
    );

    // Map content/urls back to generic names for frontend compatibility
    const modules = result.rows.map(m => ({
      ...m,
      contentextra: m.doc_content,
      // m.content is already in the main table row
    }));

    return res.status(200).json({ success: true, modules });
  } catch (err) {
    console.error("getCourseModules:", err);
    return res.status(500).json({ success: false, message: "Internal error" });
  }
};

// ─── ADMIN: Create a module ──────────────────────────────────────────────────
export const createModule = async (req, res) => {
  const { course_id } = req.params;
  const { title, type, content, video_url, image_url, duration, status, order_index } = req.body;

  if (!title) {
    return res.status(400).json({ success: false, message: "Module title is required" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Verify ownership
    const courseRes = await client.query(
      `SELECT c.id FROM courses c 
       JOIN companies comp ON c.company_id = comp.id
       WHERE c.id = $1 AND (comp.admin_id = $2 OR $3 = 'superadmin')`,
      [course_id, req.user.id, req.user.role]
    );

    if (courseRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ success: false, message: "Course not found or unauthorized" });
    }

    // 2. Insert into main table
    const mainRes = await client.query(
      `INSERT INTO course_modules (course_id, title, content, type, duration, status, order_index)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [course_id, title, content ?? null, type ?? 'docs', duration ?? null, status ?? "published", order_index ?? 0]
    );
    const newModule = mainRes.rows[0];

    // 3. Insert into sub-table
    let subId = null;
    let contentextra = req.body.contentextra || null;

    if (newModule.type === 'video') {
      const vidRes = await client.query(
        `INSERT INTO course_modules_video (course_module_id, video_url)
         VALUES ($1, $2) RETURNING id`,
        [newModule.id, video_url ?? null]
      );
      subId = vidRes.rows[0].id;
    } else {
      const docRes = await client.query(
        `INSERT INTO course_modules_docs (course_module_id, image_url, contentextra)
         VALUES ($1, $2, $3) RETURNING id`,
        [newModule.id, image_url ?? null, contentextra ?? (type === 'docs' ? content : null)] // fall back to content if contentextra missing
      );
      subId = docRes.rows[0].id;
    }

    // 4. Update main table with sub_id
    await client.query(`UPDATE course_modules SET sub_id = $1 WHERE id = $2`, [subId, newModule.id]);
    
    await client.query("COMMIT");

    return res.status(201).json({
      success: true,
      message: "Module created successfully",
      module: { ...newModule, sub_id: subId, contentextra, video_url, image_url }
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("createModule:", err);
    return res.status(500).json({ success: false, message: "Internal error" });
  } finally {
    client.release();
  }
};

// ─── ADMIN: Update a module ──────────────────────────────────────────────────
export const updateModule = async (req, res) => {
  const { id } = req.params;
  const { title, type, content, video_url, image_url, duration, status, order_index } = req.body;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Verify & check current assets
    const checkRes = await client.query(
      `SELECT m.*, d.image_url as old_image, d.contentextra as old_contentextra, v.video_url as old_video
       FROM course_modules m
       LEFT JOIN course_modules_docs d ON m.id = d.course_module_id
       LEFT JOIN course_modules_video v ON m.id = v.course_module_id
       JOIN courses c ON m.course_id = c.id
       JOIN companies comp ON c.company_id = comp.id
       WHERE m.id = $1 AND (comp.admin_id = $2 OR $3 = 'superadmin')`,
      [id, req.user.id, req.user.role]
    );

    if (checkRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ success: false, message: "Module not found or unauthorized" });
    }

    const old = checkRes.rows[0];
    const finalOrderIndex = order_index ?? old.order_index;

    // Asset cleanup
    if (video_url !== undefined && old.old_video && old.old_video !== video_url) await deleteFromCloudinary(old.old_video);
    if (image_url !== undefined && old.old_image && old.old_image !== image_url) await deleteFromCloudinary(old.old_image);

    // 2. Update main table
    const mainRes = await client.query(
      `UPDATE course_modules
       SET title = $1, content = $2, type = $3, duration = $4, status = $5, order_index = $6, updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 RETURNING *`,
      [title || old.title, content ?? old.content, type || old.type, duration ?? old.duration, status ?? old.status, finalOrderIndex, id]
    );

    // 3. Update sub-table
    let contentextra = req.body.contentextra || null;
    if ((type || old.type) === 'video') {
      await client.query(
        `UPDATE course_modules_video SET video_url = $1, updated_at = CURRENT_TIMESTAMP WHERE course_module_id = $2`,
        [video_url ?? old.old_video, id]
      );
    } else {
      await client.query(
        `UPDATE course_modules_docs SET image_url = $1, contentextra = $2, updated_at = CURRENT_TIMESTAMP WHERE course_module_id = $3`,
        [image_url ?? old.old_image, contentextra ?? old.old_contentextra, id]
      );
    }

    await client.query("COMMIT");
    return res.status(200).json({ success: true, message: "Module updated", module: mainRes.rows[0] });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("updateModule:", err);
    return res.status(500).json({ success: false, message: "Internal error" });
  } finally {
    client.release();
  }
};

// ─── ADMIN: Delete a module ──────────────────────────────────────────────────
export const deleteModule = async (req, res) => {
  const { id } = req.params;
  try {
    const checkRes = await pool.query(
      `SELECT m.*, d.image_url, v.video_url
       FROM course_modules m
       LEFT JOIN course_modules_docs d ON m.id = d.course_module_id
       LEFT JOIN course_modules_video v ON m.id = v.course_module_id
       JOIN courses c ON m.course_id = c.id
       JOIN companies comp ON c.company_id = comp.id
       WHERE m.id = $1 AND (comp.admin_id = $2 OR $3 = 'superadmin')`,
      [id, req.user.id, req.user.role]
    );

    if (checkRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Module not found or unauthorized" });
    }

    const m = checkRes.rows[0];
    if (m.video_url) await deleteFromCloudinary(m.video_url);
    if (m.image_url) await deleteFromCloudinary(m.image_url);

    await pool.query(`DELETE FROM course_modules WHERE id = $1`, [id]);
    return res.status(200).json({ success: true, message: "Module deleted" });
  } catch (err) {
    console.error("deleteModule:", err);
    return res.status(500).json({ success: false, message: "Internal error" });
  }
};

// ─── ADMIN: Get module details ──────────────────────────────────────────────
export const getModuleDetails = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT m.*,
              d.contentextra as doc_contentextra, d.image_url,
              v.video_url
       FROM course_modules m
       LEFT JOIN course_modules_docs d ON m.id = d.course_module_id AND m.type = 'docs'
       LEFT JOIN course_modules_video v ON m.id = v.course_module_id AND m.type = 'video'
       JOIN courses c ON m.course_id = c.id
       JOIN companies comp ON c.company_id = comp.id
       WHERE m.id = $1 AND (comp.admin_id = $2 OR $3 = 'superadmin')`,
      [id, req.user.id, req.user.role]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Module not found or unauthorized" });
    }

    const row = result.rows[0];
    const module = {
      ...row,
      contentextra: row.doc_contentextra,
    };

    return res.status(200).json({ success: true, module });
  } catch (err) {
    console.error("getModuleDetails:", err);
    return res.status(500).json({ success: false, message: "Internal error" });
  }
};


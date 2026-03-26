import pool from "../config/database.js";
import { deleteFromCloudinary } from "../utils/cloudinary.js";


// ─── ADMIN: Get modules for a course ─────────────────────────────────────────
export const getCourseModules = async (req, res) => {
  const { course_id } = req.params;
  try {
    // Verify course belongs to this admin's company
    const courseRes = await pool.query(
      `SELECT c.id FROM courses c 
       JOIN companies comp ON c.company_id = comp.id
       WHERE c.id = $1 AND comp.admin_id = $2`,
      [course_id, req.user.id]
    );

    if (courseRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Course not found or unauthorized" });
    }

    const result = await pool.query(
      `SELECT * FROM course_modules WHERE course_id = $1 ORDER BY order_index ASC, created_at ASC`,
      [course_id]
    );
    return res.status(200).json({ success: true, modules: result.rows });
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

  try {
    // Verify course belongs to this admin's company
    const courseRes = await pool.query(
      `SELECT c.id FROM courses c 
       JOIN companies comp ON c.company_id = comp.id
       WHERE c.id = $1 AND comp.admin_id = $2`,
      [course_id, req.user.id]
    );

    if (courseRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Course not found or unauthorized" });
    }

    const result = await pool.query(
      `INSERT INTO course_modules (course_id, title, type, content, video_url, image_url, duration, status, order_index)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [course_id, title, type ?? 'docs', content ?? null, video_url ?? null, image_url ?? null, duration ?? null, status ?? "published", order_index ?? 0]
    );





    return res.status(201).json({
      success: true,
      message: "Module created successfully",
      module: result.rows[0]
    });
  } catch (err) {
    console.error("createModule:", err);
    return res.status(500).json({ success: false, message: "Internal error" });
  }
};

// ─── ADMIN: Update a module ──────────────────────────────────────────────────
export const updateModule = async (req, res) => {
  const { id } = req.params;
  const { title, type, content, video_url, image_url, duration, status, order_index } = req.body;





  try {
    // Verify module belongs to this admin's company
    const checkRes = await pool.query(
      `SELECT m.* FROM course_modules m
       JOIN courses c ON m.course_id = c.id
       JOIN companies comp ON c.company_id = comp.id
       WHERE m.id = $1 AND comp.admin_id = $2`,

      [id, req.user.id]
    );

    if (checkRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Module not found or unauthorized" });
    }

    // Preserve order_index if not provided
    const oldModule = checkRes.rows[0];
    const finalOrderIndex = (order_index !== undefined && order_index !== null) ? order_index : (oldModule.order_index || 0);

    // 🔥 Cleanup old assets if they changed or were removed
    if (video_url !== undefined && oldModule.video_url && oldModule.video_url !== video_url) {
      await deleteFromCloudinary(oldModule.video_url);
    }
    if (image_url !== undefined && oldModule.image_url && oldModule.image_url !== image_url) {
      await deleteFromCloudinary(oldModule.image_url);
    }

    const result = await pool.query(
      `UPDATE course_modules
       SET title = $1, type = $2, content = $3, video_url = $4, image_url = $5, duration = $6, status = $7, order_index = $8, updated_at = CURRENT_TIMESTAMP
       WHERE id = $9 RETURNING *`,
      [title, type, content, video_url, image_url, duration, status, finalOrderIndex, id]
    );

  
    return res.status(200).json({
      success: true,
      message: "Module updated successfully",
      module: result.rows[0]
    });
  } catch (err) {
    console.error("updateModule:", err);
    return res.status(500).json({ success: false, message: "Internal error" });
  }
};

// ─── ADMIN: Delete a module ──────────────────────────────────────────────────
export const deleteModule = async (req, res) => {
  const { id } = req.params;
  try {
    // Verify module belongs to this admin's company
    const checkRes = await pool.query(
      `SELECT m.* FROM course_modules m
       JOIN courses c ON m.course_id = c.id
       JOIN companies comp ON c.company_id = comp.id
       WHERE m.id = $1 AND comp.admin_id = $2`,
      [id, req.user.id]
    );

    if (checkRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Module not found or unauthorized" });
    }

    const m = checkRes.rows[0];

    // Delete assets from cloudinary
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
      `SELECT m.* FROM course_modules m
       JOIN courses c ON m.course_id = c.id
       JOIN companies comp ON c.company_id = comp.id
       WHERE m.id = $1 AND comp.admin_id = $2`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Module not found or unauthorized" });
    }

    return res.status(200).json({
      success: true,
      module: result.rows[0]
    });
  } catch (err) {
    console.error("getModuleDetails:", err);
    return res.status(500).json({ success: false, message: "Internal error" });
  }
};


const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Express server is running successfully!");
});
app.get("/check-config", (req, res) => {
  res.json({
    databaseUrlExists: !!process.env.DATABASE_URL,
    databaseUrlLength: process.env.DATABASE_URL?.length || 0,
    port: process.env.PORT,
  });
});
// Get all users
app.get("/users", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users");

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("POSTGRES ERROR:", error);

    res.status(500).json({
      message: "Database error",
      error: error.message,
    });
  }
});
// Get all users

// Get all tasks
// app.get("/tasks", async (req, res) => {
//   try {
//     const result = await pool.query(
//       `SELECT * FROM tasks ORDER BY "createdAt" DESC`,
//     );

//     res.status(200).json(result.rows);
//   } catch (error) {
//     console.error("GET TASKS ERROR:", error);

//     res.status(500).json({
//       message: "Failed to fetch tasks",
//       error: error.message,
//     });
//   }
// });
app.get("/tasks", async (req, res) => {
  const {
    title,
    description,
    createdBy,
    priority,
    assignees,
    moduleName,
    tags,
    estimatedHours,
    estimatedMinutes,
    startDate,
    endDate,
    stage,
    loggedTime,
    attachments,
    comments,
    history,
  } = req.query;

  try {
    let query = `SELECT * FROM tasks`;
    const values = [];
    const conditions = [];

    // =========================
    // NORMAL TEXT / UUID FIELDS
    // =========================

    if (title) {
      values.push(`%${title}%`);
      conditions.push(`title ILIKE $${values.length}`);
    }

    if (description) {
      values.push(`%${description}%`);
      conditions.push(`description ILIKE $${values.length}`);
    }

    if (createdBy) {
      values.push(createdBy);
      conditions.push(`"createdBy" = $${values.length}`);
    }

    if (priority) {
      values.push(priority);
      conditions.push(`priority = $${values.length}`);
    }

    if (moduleName) {
      values.push(moduleName);
      conditions.push(`"moduleName" = $${values.length}`);
    }

    if (stage) {
      values.push(stage);
      conditions.push(`stage = $${values.length}`);
    }

    // =========================
    // ASSIGNEES JSONB
    // =========================

    if (assignees) {
      values.push(assignees);

      conditions.push(`
        assignees @> $${values.length}::jsonb
      `);
    }

    // =========================
    // TAGS JSONB
    // =========================

    if (tags) {
      values.push(tags);

      conditions.push(`
        tags @> $${values.length}::jsonb
      `);
    }

    // =========================
    // ESTIMATED TIME JSONB
    // =========================

    if (estimatedHours) {
      values.push(Number(estimatedHours));

      conditions.push(`
        ("estimatedTime"->>'h')::int = $${values.length}
      `);
    }

    if (estimatedMinutes) {
      values.push(Number(estimatedMinutes));

      conditions.push(`
        ("estimatedTime"->>'m')::int = $${values.length}
      `);
    }

    // =========================
    // LOGGED TIME JSONB
    // =========================

    if (loggedTime) {
      values.push(loggedTime);

      conditions.push(`
        "loggedTime" @> $${values.length}::jsonb
      `);
    }

    // =========================
    // ATTACHMENTS JSONB
    // =========================

    if (attachments) {
      values.push(attachments);

      conditions.push(`
        attachments @> $${values.length}::jsonb
      `);
    }

    // =========================
    // COMMENTS JSONB
    // =========================

    if (comments) {
      values.push(comments);

      conditions.push(`
        comments @> $${values.length}::jsonb
      `);
    }

    // =========================
    // HISTORY JSONB
    // =========================

    if (history) {
      values.push(history);

      conditions.push(`
        history @> $${values.length}::jsonb
      `);
    }

    // =========================
    // DATE FILTERS
    // =========================

    if (startDate === null) {
      conditions.push(`"startDate" IS NULL`);
    } else if (startDate) {
      values.push(startDate);

      conditions.push(`
    "startDate" >= $${values.length}
  `);
    }

    if (endDate === null) {
      conditions.push(`"endDate" IS NULL`);
    } else if (endDate) {
      values.push(endDate);

      conditions.push(`
    "endDate" >= $${values.length}
  `);
    }

    // =========================
    // ADD WHERE
    // =========================

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    query += ` ORDER BY "createdAt" DESC`;

    const result = await pool.query(query, values);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("GET TASKS ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch tasks",
      error: error.message,
    });
  }
});
// Get all tasks

// create task
// create task
app.post("/tasks", async (req, res) => {
  const {
    title,
    description,
    createdBy,
    priority,
    assignees,
    moduleName,
    tags,
    estimatedTime,
    loggedTime,
    attachments,
    startDate,
    endDate,
    stage,
    comments,
    history,
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO tasks (
        title,
        description,
        "createdBy",
        priority,
        assignees,
        "moduleName",
        tags,
        "estimatedTime",
        "loggedTime",
        attachments,
        "startDate",
        "endDate",
        stage,
        comments,
        history
      )
      VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15
      )
      RETURNING *`,
      [
        title,
        description,
        createdBy,
        priority,
        JSON.stringify(assignees),
        moduleName,
        JSON.stringify(tags),
        JSON.stringify(estimatedTime),
        JSON.stringify(loggedTime),
        JSON.stringify(attachments),
        startDate,
        endDate,
        stage,
        JSON.stringify(comments),
        JSON.stringify(history),
      ],
    );

    res.status(201).json({
      message: "Task created successfully",
      task: result.rows[0],
    });
  } catch (error) {
    console.error("CREATE TASK ERROR:", error);

    res.status(500).json({
      message: "Failed to create task",
      error: error.message,
    });
  }
});
// create task

// update task with id
// edit task
app.put("/tasks/:id", async (req, res) => {
  const { id } = req.params;

  const {
    title,
    description,
    priority,
    assignees,
    moduleName,
    tags,
    estimatedTime,
    loggedTime,
    attachments,
    startDate,
    endDate,
    stage,
    comments,
    history,
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE tasks
       SET
         title = $1,
         description = $2,
         priority = $3,
         assignees = $4,
         "moduleName" = $5,
         tags = $6,
         "estimatedTime" = $7,
         "loggedTime" = $8,
         attachments = $9,
         "startDate" = $10,
         "endDate" = $11,
         stage = $12,
         comments = $13,
         history = $14,
         "updatedAt" = NOW()
       WHERE id = $15
       RETURNING *`,
      [
        title,
        description,
        priority,
        JSON.stringify(assignees),
        moduleName,
        JSON.stringify(tags),
        JSON.stringify(estimatedTime),
        JSON.stringify(loggedTime),
        JSON.stringify(attachments),
        startDate,
        endDate,
        stage,
        JSON.stringify(comments),
        JSON.stringify(history),
        id,
      ],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.status(200).json({
      message: "Task updated successfully",
      task: result.rows[0],
    });
  } catch (error) {
    console.error("UPDATE TASK ERROR:", error);

    res.status(500).json({
      message: "Failed to update task",
      error: error.message,
    });
  }
});
// update task with id

// delete task by id
app.delete("/tasks/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `DELETE FROM tasks
       WHERE id = $1
       RETURNING *`,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.status(200).json({
      message: "Task deleted successfully",
      task: result.rows[0],
    });
  } catch (error) {
    console.error("DELETE TASK ERROR:", error);

    res.status(500).json({
      message: "Failed to delete task",
      error: error.message,
    });
  }
});
// delete task by id

app.listen(process.env.PORT || 3000, "0.0.0.0", () => {
  console.log("Express server running");
});

"use strict";

module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || "development",
  DATABASE_URL:
    process.env.DATABASE_URL ||
    "postgres://mzyftcfd:dxNTpUyMK6PCkdiQVmJT4W8f-PCfaACm@hansken.db.elephantsql.com/mzyftcfd",
  JWT_SECRET: process.env.JWT_SECRET || "oz-special-jwt-secret",
};

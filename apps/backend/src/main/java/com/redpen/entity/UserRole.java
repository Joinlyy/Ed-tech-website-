package com.redpen.entity;

/**
 * Roles in RedPen:
 * PARENT — paying account holder.
 * STUDENT — child under a family.
 * STAFF — evaluator.
 * SUB_ADMIN — delegated staff member with specific checkbox permissions.
 * ADMIN — full platform king access.
 * CLIENT — legacy.
 */
public enum UserRole {
    CLIENT,
    PARENT,
    STUDENT,
    STAFF,
    SUB_ADMIN,
    ADMIN
}

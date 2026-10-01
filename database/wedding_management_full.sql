-- =============================================================
-- HE THONG QUAN LY DICH VU TIEC CUOI NGOC HY
-- MySQL 8.0+
-- Tao database, toan bo bang, khoa ngoai va du lieu mau.
-- File khong chua mat khau MySQL hoac khoa API.
-- =============================================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

CREATE DATABASE IF NOT EXISTS `wedding_management`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `wedding_management`;

-- CreateTable
CREATE TABLE `menu_combos` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `group_name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `price_per_table` DECIMAL(14, 2) NOT NULL DEFAULT 0,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    UNIQUE INDEX `menu_combos_code_key`(`code`),
    INDEX `menu_combos_is_active_sort_order_idx`(`is_active`, `sort_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `menu_dishes` (
    `id` VARCHAR(191) NOT NULL,
    `combo_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `reference_url` VARCHAR(500) NULL,
    `image_url` VARCHAR(500) NULL,
    `description` VARCHAR(191) NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    INDEX `menu_dishes_combo_id_is_active_sort_order_idx`(`combo_id`, `is_active`, `sort_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `contract_menu_items` (
    `id` VARCHAR(191) NOT NULL,
    `contract_id` VARCHAR(191) NOT NULL,
    `source_dish_id` VARCHAR(191) NULL,
    `original_dish_name` VARCHAR(191) NOT NULL,
    `selected_dish_name` VARCHAR(191) NOT NULL,
    `reference_url` VARCHAR(500) NULL,
    `image_url` VARCHAR(500) NULL,
    `is_replacement` BOOLEAN NOT NULL DEFAULT false,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    INDEX `contract_menu_items_contract_id_sort_order_idx`(`contract_id`, `sort_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `contract_signatures` (
    `id` VARCHAR(191) NOT NULL,
    `contract_id` VARCHAR(191) NOT NULL,
    `signer_id` VARCHAR(191) NOT NULL,
    `signer_name` VARCHAR(191) NOT NULL,
    `signature_url` VARCHAR(500) NOT NULL,
    `document_hash` VARCHAR(64) NOT NULL,
    `consent_version` VARCHAR(191) NOT NULL DEFAULT 'green-wedding-contract-v1',
    `ip_address` VARCHAR(191) NULL,
    `user_agent` TEXT NULL,
    `signed_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE INDEX `contract_signatures_contract_id_key`(`contract_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `roles` (
    `id` VARCHAR(191) NOT NULL,
    `code` ENUM('ADMIN', 'STAFF', 'CUSTOMER') NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `roles_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `role_id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password_hash` VARCHAR(191) NOT NULL,
    `full_name` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `avatar_url` VARCHAR(191) NULL,
    `status` ENUM('ACTIVE', 'INACTIVE', 'LOCKED') NOT NULL DEFAULT 'ACTIVE',
    `last_login_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    INDEX `users_role_id_status_idx`(`role_id`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `refresh_tokens` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `token_hash` VARCHAR(191) NOT NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `revoked_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `refresh_tokens_token_hash_key`(`token_hash`),
    INDEX `refresh_tokens_user_id_expires_at_idx`(`user_id`, `expires_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `wedding_packages` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `style` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `image_url` VARCHAR(191) NULL,
    `base_price` DECIMAL(14, 2) NOT NULL,
    `standard_tables` INTEGER NOT NULL,
    `is_featured` BOOLEAN NOT NULL DEFAULT false,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `wedding_packages_slug_key`(`slug`),
    INDEX `wedding_packages_is_active_is_featured_idx`(`is_active`, `is_featured`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `package_images` (
    `id` VARCHAR(191) NOT NULL,
    `package_id` VARCHAR(191) NOT NULL,
    `url` VARCHAR(500) NOT NULL,
    `alt_text` VARCHAR(255) NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `is_cover` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `package_images_package_id_sort_order_idx`(`package_id`, `sort_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `catalog_items` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` ENUM('FOOD', 'SERVICE', 'DECORATION', 'EQUIPMENT', 'TRANSPORT') NOT NULL,
    `description` VARCHAR(191) NULL,
    `image_url` VARCHAR(191) NULL,
    `unit` VARCHAR(191) NOT NULL DEFAULT 'goi',
    `unit_price` DECIMAL(14, 2) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `catalog_items_type_is_active_idx`(`type`, `is_active`),
    UNIQUE INDEX `catalog_items_name_type_key`(`name`, `type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `package_catalog_items` (
    `id` VARCHAR(191) NOT NULL,
    `package_id` VARCHAR(191) NOT NULL,
    `catalog_item_id` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `is_required` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `package_catalog_items_package_id_catalog_item_id_key`(`package_id`, `catalog_item_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `wedding_contracts` (
    `id` VARCHAR(191) NOT NULL,
    `contract_code` VARCHAR(191) NOT NULL,
    `customer_id` VARCHAR(191) NOT NULL,
    `package_id` VARCHAR(191) NOT NULL,
    `menu_combo_id` VARCHAR(191) NULL,
    `host_name` VARCHAR(191) NOT NULL,
    `host_phone` VARCHAR(191) NOT NULL,
    `table_count` INTEGER NOT NULL,
    `setup_date` DATETIME(3) NOT NULL,
    `event_date` DATETIME(3) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `formatted_address` VARCHAR(191) NULL,
    `latitude` DECIMAL(10, 7) NULL,
    `longitude` DECIMAL(10, 7) NULL,
    `place_id` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `subtotal` DECIMAL(14, 2) NOT NULL,
    `total_amount` DECIMAL(14, 2) NOT NULL,
    `deposit_rate` DECIMAL(5, 2) NOT NULL,
    `deposit_amount` DECIMAL(14, 2) NOT NULL,
    `paid_amount` DECIMAL(14, 2) NOT NULL DEFAULT 0,
    `remaining_amount` DECIMAL(14, 2) NOT NULL,
    `status` ENUM('DRAFT', 'PENDING_DEPOSIT', 'DEPOSITED', 'APPROVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'REJECTED') NOT NULL DEFAULT 'PENDING_DEPOSIT',
    `approved_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `wedding_contracts_contract_code_key`(`contract_code`),
    INDEX `wedding_contracts_customer_id_status_idx`(`customer_id`, `status`),
    INDEX `wedding_contracts_event_date_status_idx`(`event_date`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contract_items` (
    `id` VARCHAR(191) NOT NULL,
    `contract_id` VARCHAR(191) NOT NULL,
    `catalog_item_id` VARCHAR(191) NOT NULL,
    `item_name` VARCHAR(191) NOT NULL,
    `item_type` ENUM('FOOD', 'SERVICE', 'DECORATION', 'EQUIPMENT', 'TRANSPORT') NOT NULL,
    `unit_price` DECIMAL(14, 2) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `line_total` DECIMAL(14, 2) NOT NULL,

    INDEX `contract_items_contract_id_idx`(`contract_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contract_payments` (
    `id` VARCHAR(191) NOT NULL,
    `contract_id` VARCHAR(191) NOT NULL,
    `transaction_code` VARCHAR(191) NOT NULL,
    `transfer_content` VARCHAR(191) NOT NULL,
    `type` ENUM('DEPOSIT', 'REMAINING', 'REFUND') NOT NULL,
    `expected_amount` DECIMAL(14, 2) NOT NULL,
    `received_amount` DECIMAL(14, 2) NOT NULL DEFAULT 0,
    `status` ENUM('PENDING', 'SUCCESS', 'PARTIAL', 'OVERPAID', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    `external_reference` VARCHAR(191) NULL,
    `paid_at` DATETIME(3) NULL,
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `contract_payments_transaction_code_key`(`transaction_code`),
    UNIQUE INDEX `contract_payments_transfer_content_key`(`transfer_content`),
    UNIQUE INDEX `contract_payments_external_reference_key`(`external_reference`),
    INDEX `contract_payments_contract_id_status_idx`(`contract_id`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `daily_capacities` (
    `id` VARCHAR(191) NOT NULL,
    `date` DATE NOT NULL,
    `max_events` INTEGER NOT NULL,
    `notes` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `daily_capacities_date_key`(`date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `staff_rates` (
    `id` VARCHAR(191) NOT NULL,
    `job_name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `amount` DECIMAL(14, 2) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `staff_rates_job_name_key`(`job_name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `staff_assignments` (
    `id` VARCHAR(191) NOT NULL,
    `contract_id` VARCHAR(191) NOT NULL,
    `staff_id` VARCHAR(191) NOT NULL,
    `staff_rate_id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `start_time` DATETIME(3) NOT NULL,
    `end_time` DATETIME(3) NOT NULL,
    `wage_amount` DECIMAL(14, 2) NOT NULL,
    `status` ENUM('SCHEDULED', 'CHECKED_IN', 'CHECKED_OUT', 'COMPLETED', 'CANCELLED', 'REJECTED') NOT NULL DEFAULT 'SCHEDULED',
    `actual_checkin` DATETIME(3) NULL,
    `actual_checkout` DATETIME(3) NULL,
    `completion_notes` VARCHAR(191) NULL,
    `paid_at` DATETIME(3) NULL,
    `paid_by_id` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `staff_assignments_staff_id_start_time_end_time_status_idx`(`staff_id`, `start_time`, `end_time`, `status`),
    INDEX `staff_assignments_contract_id_idx`(`contract_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `assignment_photos` (
    `id` VARCHAR(191) NOT NULL,
    `assignment_id` VARCHAR(191) NOT NULL,
    `uploader_id` VARCHAR(191) NOT NULL,
    `type` ENUM('BEFORE_SETUP', 'AFTER_SETUP', 'DAMAGE_ISSUE') NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `thumbnail_url` VARCHAR(191) NULL,
    `note` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `assignment_photos_assignment_id_type_idx`(`assignment_id`, `type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `damage_reports` (
    `id` VARCHAR(191) NOT NULL,
    `contract_id` VARCHAR(191) NOT NULL,
    `assignment_id` VARCHAR(191) NOT NULL,
    `reporter_id` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `estimated_cost` DECIMAL(14, 2) NULL,
    `approved_cost` DECIMAL(14, 2) NULL,
    `status` ENUM('PENDING', 'REVIEWING', 'APPROVED', 'REJECTED', 'RESOLVED') NOT NULL DEFAULT 'PENDING',
    `review_note` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `damage_reports_status_created_at_idx`(`status`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `damage_cost_items` (
    `id` VARCHAR(191) NOT NULL,
    `damage_report_id` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(14, 2) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `casso_webhook_events` (
    `id` VARCHAR(191) NOT NULL,
    `external_event_id` VARCHAR(191) NOT NULL,
    `payload` JSON NOT NULL,
    `signature_valid` BOOLEAN NOT NULL,
    `processed` BOOLEAN NOT NULL DEFAULT false,
    `error_message` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `processed_at` DATETIME(3) NULL,

    UNIQUE INDEX `casso_webhook_events_external_event_id_key`(`external_event_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chatbot_conversations` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NULL,
    `title` VARCHAR(191) NOT NULL DEFAULT 'Cuoc tro chuyen moi',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `chatbot_conversations_user_id_updated_at_idx`(`user_id`, `updated_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chatbot_messages` (
    `id` VARCHAR(191) NOT NULL,
    `conversation_id` VARCHAR(191) NOT NULL,
    `role` ENUM('USER', 'ASSISTANT', 'SYSTEM') NOT NULL,
    `content` TEXT NOT NULL,
    `media` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `chatbot_messages_conversation_id_created_at_idx`(`conversation_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chatbot_faqs` (
    `id` VARCHAR(191) NOT NULL,
    `question` VARCHAR(191) NOT NULL,
    `answer` TEXT NOT NULL,
    `keywords` VARCHAR(191) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `chatbot_faqs_is_active_idx`(`is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `link` VARCHAR(191) NULL,
    `read_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `notifications_user_id_read_at_created_at_idx`(`user_id`, `read_at`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `audit_logs` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NULL,
    `action` VARCHAR(191) NOT NULL,
    `entity_type` VARCHAR(191) NOT NULL,
    `entity_id` VARCHAR(191) NULL,
    `old_data` JSON NULL,
    `new_data` JSON NULL,
    `ip_address` VARCHAR(191) NULL,
    `user_agent` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `audit_logs_entity_type_entity_id_idx`(`entity_type`, `entity_id`),
    INDEX `audit_logs_user_id_created_at_idx`(`user_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `support_requests` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `message` TEXT NOT NULL,
    `status` ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED') NOT NULL DEFAULT 'OPEN',
    `admin_note` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `support_requests_status_created_at_idx`(`status`, `created_at`),
    INDEX `support_requests_user_id_created_at_idx`(`user_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `menu_dishes` ADD CONSTRAINT `menu_dishes_combo_id_fkey` FOREIGN KEY (`combo_id`) REFERENCES `menu_combos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `contract_menu_items` ADD CONSTRAINT `contract_menu_items_contract_id_fkey` FOREIGN KEY (`contract_id`) REFERENCES `wedding_contracts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `contract_menu_items` ADD CONSTRAINT `contract_menu_items_source_dish_id_fkey` FOREIGN KEY (`source_dish_id`) REFERENCES `menu_dishes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `contract_signatures` ADD CONSTRAINT `contract_signatures_contract_id_fkey` FOREIGN KEY (`contract_id`) REFERENCES `wedding_contracts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `contract_signatures` ADD CONSTRAINT `contract_signatures_signer_id_fkey` FOREIGN KEY (`signer_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `refresh_tokens` ADD CONSTRAINT `refresh_tokens_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `package_catalog_items` ADD CONSTRAINT `package_catalog_items_package_id_fkey` FOREIGN KEY (`package_id`) REFERENCES `wedding_packages`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `package_catalog_items` ADD CONSTRAINT `package_catalog_items_catalog_item_id_fkey` FOREIGN KEY (`catalog_item_id`) REFERENCES `catalog_items`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `package_images` ADD CONSTRAINT `package_images_package_id_fkey` FOREIGN KEY (`package_id`) REFERENCES `wedding_packages`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wedding_contracts` ADD CONSTRAINT `wedding_contracts_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wedding_contracts` ADD CONSTRAINT `wedding_contracts_package_id_fkey` FOREIGN KEY (`package_id`) REFERENCES `wedding_packages`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `wedding_contracts` ADD CONSTRAINT `wedding_contracts_menu_combo_id_fkey` FOREIGN KEY (`menu_combo_id`) REFERENCES `menu_combos`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contract_items` ADD CONSTRAINT `contract_items_contract_id_fkey` FOREIGN KEY (`contract_id`) REFERENCES `wedding_contracts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contract_items` ADD CONSTRAINT `contract_items_catalog_item_id_fkey` FOREIGN KEY (`catalog_item_id`) REFERENCES `catalog_items`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contract_payments` ADD CONSTRAINT `contract_payments_contract_id_fkey` FOREIGN KEY (`contract_id`) REFERENCES `wedding_contracts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `staff_assignments` ADD CONSTRAINT `staff_assignments_contract_id_fkey` FOREIGN KEY (`contract_id`) REFERENCES `wedding_contracts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `staff_assignments` ADD CONSTRAINT `staff_assignments_staff_id_fkey` FOREIGN KEY (`staff_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `staff_assignments` ADD CONSTRAINT `staff_assignments_staff_rate_id_fkey` FOREIGN KEY (`staff_rate_id`) REFERENCES `staff_rates`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assignment_photos` ADD CONSTRAINT `assignment_photos_assignment_id_fkey` FOREIGN KEY (`assignment_id`) REFERENCES `staff_assignments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assignment_photos` ADD CONSTRAINT `assignment_photos_uploader_id_fkey` FOREIGN KEY (`uploader_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `damage_reports` ADD CONSTRAINT `damage_reports_contract_id_fkey` FOREIGN KEY (`contract_id`) REFERENCES `wedding_contracts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `damage_reports` ADD CONSTRAINT `damage_reports_assignment_id_fkey` FOREIGN KEY (`assignment_id`) REFERENCES `staff_assignments`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `damage_reports` ADD CONSTRAINT `damage_reports_reporter_id_fkey` FOREIGN KEY (`reporter_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `damage_cost_items` ADD CONSTRAINT `damage_cost_items_damage_report_id_fkey` FOREIGN KEY (`damage_report_id`) REFERENCES `damage_reports`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chatbot_conversations` ADD CONSTRAINT `chatbot_conversations_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chatbot_messages` ADD CONSTRAINT `chatbot_messages_conversation_id_fkey` FOREIGN KEY (`conversation_id`) REFERENCES `chatbot_conversations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `support_requests` ADD CONSTRAINT `support_requests_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- =============================================================
-- DU LIEU MAU
-- Tai khoan dang nhap dung chung mat khau: Wedding@123
-- =============================================================

START TRANSACTION;

INSERT INTO `roles` (`id`, `code`, `name`, `description`, `created_at`, `updated_at`) VALUES
('role_admin', 'ADMIN', 'Quản trị viên', 'Quản lý toàn bộ hệ thống', NOW(3), NOW(3)),
('role_staff', 'STAFF', 'Nhân viên', 'Thực hiện các ca được phân công', NOW(3), NOW(3)),
('role_customer', 'CUSTOMER', 'Khách hàng', 'Đặt và theo dõi dịch vụ tiệc cưới', NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE
  `name` = VALUES(`name`),
  `description` = VALUES(`description`),
  `updated_at` = NOW(3);

INSERT INTO `users` (`id`, `role_id`, `email`, `password_hash`, `full_name`, `phone`, `status`, `created_at`, `updated_at`) VALUES
('user_admin', 'role_admin', 'admin@example.com', '$2b$12$TloKOH/N2JWvaixzOALx.uicD7T3zgKNljtWIfxU9ZBq4.0QvuQvq', 'Quản trị viên', '0799392717', 'ACTIVE', NOW(3), NOW(3)),
('user_staff_1', 'role_staff', 'staff1@example.com', '$2b$12$TloKOH/N2JWvaixzOALx.uicD7T3zgKNljtWIfxU9ZBq4.0QvuQvq', 'Nguyễn Minh Anh', '0799392717', 'ACTIVE', NOW(3), NOW(3)),
('user_staff_2', 'role_staff', 'staff2@example.com', '$2b$12$TloKOH/N2JWvaixzOALx.uicD7T3zgKNljtWIfxU9ZBq4.0QvuQvq', 'Trần Bảo Châu', '0799392717', 'ACTIVE', NOW(3), NOW(3)),
('user_customer_demo', 'role_customer', 'customer@example.com', '$2b$12$TloKOH/N2JWvaixzOALx.uicD7T3zgKNljtWIfxU9ZBq4.0QvuQvq', 'Khách hàng mẫu', '0799392717', 'ACTIVE', NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE
  `role_id` = VALUES(`role_id`),
  `password_hash` = VALUES(`password_hash`),
  `full_name` = VALUES(`full_name`),
  `phone` = VALUES(`phone`),
  `status` = 'ACTIVE',
  `updated_at` = NOW(3);

INSERT INTO `wedding_packages` (`id`, `name`, `slug`, `style`, `description`, `image_url`, `base_price`, `standard_tables`, `is_featured`, `is_active`, `created_at`, `updated_at`) VALUES
('pkg_economy', 'Gói Tiết kiệm', 'goi-tiet-kiem', 'Tối giản', 'Lựa chọn gọn gàng, ấm cúng cho tiệc cưới quy mô nhỏ.', 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1600&q=85', 28000000, 15, FALSE, TRUE, NOW(3), NOW(3)),
('pkg_traditional', 'Gói Truyền thống', 'goi-truyen-thong', 'Truyền thống', 'Không gian trang trọng với đầy đủ nghi lễ và dịch vụ cần thiết.', 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=85', 42000000, 20, TRUE, TRUE, NOW(3), NOW(3)),
('pkg_rustic', 'Gói Rustic', 'goi-rustic', 'Rustic', 'Chất liệu mộc, hoa lá tự nhiên và không gian gần gũi.', 'https://images.unsplash.com/photo-1507504031003-b417219a0fde?auto=format&fit=crop&w=1600&q=85', 56000000, 20, TRUE, TRUE, NOW(3), NOW(3)),
('pkg_modern', 'Gói Hiện đại', 'goi-hien-dai', 'Hiện đại', 'Thiết kế thanh lịch, ánh sáng tinh tế và quy trình chuyên nghiệp.', 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1600&q=85', 72000000, 25, TRUE, TRUE, NOW(3), NOW(3)),
('pkg_vip', 'Gói VIP', 'goi-vip', 'Sang trọng', 'Trải nghiệm trọn gói cao cấp với trang trí và dịch vụ cá nhân hóa.', 'https://images.unsplash.com/photo-1544078751-58fee2d8a03b?auto=format&fit=crop&w=1600&q=85', 120000000, 30, TRUE, TRUE, NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE
  `name` = VALUES(`name`),
  `style` = VALUES(`style`),
  `description` = VALUES(`description`),
  `image_url` = VALUES(`image_url`),
  `base_price` = VALUES(`base_price`),
  `standard_tables` = VALUES(`standard_tables`),
  `is_featured` = VALUES(`is_featured`),
  `is_active` = TRUE,
  `updated_at` = NOW(3);

INSERT INTO `menu_combos` (`id`, `code`, `name`, `group_name`, `description`, `price_per_table`, `sort_order`, `is_active`, `created_at`, `updated_at`) VALUES
('combo_bo1_td1', 'BO1_TD1', 'Thực đơn 1', 'Bộ thực đơn 1', NULL, 0, 101, TRUE, NOW(3), NOW(3)),
('combo_bo1_td2', 'BO1_TD2', 'Thực đơn 2', 'Bộ thực đơn 1', NULL, 0, 102, TRUE, NOW(3), NOW(3)),
('combo_bo1_td3', 'BO1_TD3', 'Thực đơn 3', 'Bộ thực đơn 1', NULL, 0, 103, TRUE, NOW(3), NOW(3)),
('combo_bo1_td4', 'BO1_TD4', 'Thực đơn 4', 'Bộ thực đơn 1', NULL, 0, 104, TRUE, NOW(3), NOW(3)),
('combo_bo1_td5', 'BO1_TD5', 'Thực đơn 5', 'Bộ thực đơn 1', NULL, 0, 105, TRUE, NOW(3), NOW(3)),
('combo_bo2_td1', 'BO2_TD1', 'Thực đơn 1', 'Bộ thực đơn 2', NULL, 0, 201, TRUE, NOW(3), NOW(3)),
('combo_bo2_td2', 'BO2_TD2', 'Thực đơn 2', 'Bộ thực đơn 2', NULL, 0, 202, TRUE, NOW(3), NOW(3)),
('combo_bo2_td3', 'BO2_TD3', 'Thực đơn 3', 'Bộ thực đơn 2', NULL, 0, 203, TRUE, NOW(3), NOW(3)),
('combo_bo2_td4', 'BO2_TD4', 'Thực đơn 4', 'Bộ thực đơn 2', NULL, 0, 204, TRUE, NOW(3), NOW(3)),
('combo_bo2_td5', 'BO2_TD5', 'Thực đơn 5', 'Bộ thực đơn 2', NULL, 0, 205, TRUE, NOW(3), NOW(3)),
('combo_bo3_td1', 'BO3_TD1', 'Thực đơn 1', 'Bộ thực đơn 3', NULL, 0, 301, TRUE, NOW(3), NOW(3)),
('combo_bo3_td2', 'BO3_TD2', 'Thực đơn 2', 'Bộ thực đơn 3', NULL, 0, 302, TRUE, NOW(3), NOW(3)),
('combo_bo3_td3', 'BO3_TD3', 'Thực đơn 3', 'Bộ thực đơn 3', NULL, 0, 303, TRUE, NOW(3), NOW(3)),
('combo_bo3_td4', 'BO3_TD4', 'Thực đơn 4', 'Bộ thực đơn 3', NULL, 0, 304, TRUE, NOW(3), NOW(3)),
('combo_bo3_td5', 'BO3_TD5', 'Thực đơn 5', 'Bộ thực đơn 3', NULL, 0, 305, TRUE, NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `group_name` = VALUES(`group_name`), `sort_order` = VALUES(`sort_order`), `is_active` = TRUE, `updated_at` = NOW(3);

INSERT INTO `menu_dishes` (`id`, `combo_id`, `name`, `reference_url`, `description`, `sort_order`, `is_active`, `created_at`, `updated_at`) VALUES
('dish_bo1_td1_1','combo_bo1_td1','Súp cua nấm tuyết',NULL,NULL,0,TRUE,NOW(3),NOW(3)),
('dish_bo1_td1_2','combo_bo1_td1','Gỏi ngó sen tôm thịt','https://www.bachhoaxanh.com/kinh-nghiem-hay/cach-lam-goi-ngo-sen-gion-ngon-1084621',NULL,1,TRUE,NOW(3),NOW(3)),
('dish_bo1_td1_3','combo_bo1_td1','Tôm sú sốt Thượng Hải',NULL,NULL,2,TRUE,NOW(3),NOW(3)),
('dish_bo1_td1_4','combo_bo1_td1','Gà hấp lá chanh','https://www.bachhoaxanh.com/kinh-nghiem-hay/cach-lam-ga-hap-la-chanh-thit-ngot-thom-tham-vi-1372825',NULL,3,TRUE,NOW(3),NOW(3)),
('dish_bo1_td1_5','combo_bo1_td1','Bò xào thiên lý','https://www.bachhoaxanh.com/kinh-nghiem-hay/thit-bo-xao-hoa-thien-ly-mem-thom-hap-dan-cho-bua-com-trua-1194709',NULL,4,TRUE,NOW(3),NOW(3)),
('dish_bo1_td1_6','combo_bo1_td1','Lẩu hải sản','https://www.bachhoaxanh.com/kinh-nghiem-hay/tong-hop-3-cach-nau-lau-hai-san-thom-ngon-tai-nha-1330480',NULL,5,TRUE,NOW(3),NOW(3)),
('dish_bo1_td1_7','combo_bo1_td1','Rau câu 3 màu','https://www.bachhoaxanh.com/banh-caramen-banh-flan/rau-cau-3-mau-hoang-huong-hu-100g',NULL,6,TRUE,NOW(3),NOW(3)),
('dish_bo1_td2_1','combo_bo1_td2','Gỏi ngó sen tôm thịt',NULL,NULL,0,TRUE,NOW(3),NOW(3)),
('dish_bo1_td2_2','combo_bo1_td2','Gà bó xôi','https://www.bachhoaxanh.com/kinh-nghiem-hay/huong-dan-cach-lam-ga-bo-xoi-chien-phong-gion-ngon-1371913',NULL,1,TRUE,NOW(3),NOW(3)),
('dish_bo1_td2_3','combo_bo1_td2','Cá tai tượng chiên xù','https://www.bachhoaxanh.com/kinh-nghiem-hay/cach-lam-ca-tai-tuong-chien-xu-sieu-de-sieu-ngon-1115189',NULL,2,TRUE,NOW(3),NOW(3)),
('dish_bo1_td2_4','combo_bo1_td2','Lẩu hải sản',NULL,NULL,3,TRUE,NOW(3),NOW(3)),
('dish_bo1_td2_5','combo_bo1_td2','Mực xào thập cẩm','https://www.bachhoaxanh.com/kinh-nghiem-hay/cach-lam-muc-xao-thap-cam-thom-ngon-hap-dan-tai-nha-1380794',NULL,4,TRUE,NOW(3),NOW(3)),
('dish_bo1_td2_6','combo_bo1_td2','Rau câu trái cây','https://www.bachhoaxanh.com/rau-cau/thach-rau-cau-huong-trai-cay-nhiet-doi-trai-cay-new-choice',NULL,5,TRUE,NOW(3),NOW(3)),
('dish_bo1_td2_7','combo_bo1_td2','Chè khúc bạch','https://www.bachhoaxanh.com/kinh-nghiem-hay/cach-lam-che-khuc-bach-sieu-ngon-giai-nhiet-1031511',NULL,6,TRUE,NOW(3),NOW(3)),
('dish_bo1_td3_1','combo_bo1_td3','Chả giò hải sản','https://www.bachhoaxanh.com/kinh-nghiem-hay/cha-gio-hai-san-chien-xu-xot-mayonnaise-ngon-cuc-1229491',NULL,0,TRUE,NOW(3),NOW(3)),
('dish_bo1_td3_2','combo_bo1_td3','Bò né bông thiên lý','https://www.bachhoaxanh.com/kinh-nghiem-hay/cach-lam-bo-ne-hoa-thien-ly-don-gian-thom-ngon-cuc-bo-duong-1373674',NULL,1,TRUE,NOW(3),NOW(3)),
('dish_bo1_td3_3','combo_bo1_td3','Lẩu cá bóp măng chua','https://www.bachhoaxanh.com/kinh-nghiem-hay/cach-nau-lau-ca-bop-mang-chua-cay-ngon-hap-dan-1374344',NULL,2,TRUE,NOW(3),NOW(3)),
('dish_bo1_td3_4','combo_bo1_td3','Tôm càng xanh rang XO',NULL,NULL,3,TRUE,NOW(3),NOW(3)),
('dish_bo1_td3_5','combo_bo1_td3','Gà hấp cải xanh và xôi','https://www.bachhoaxanh.com/kinh-nghiem-hay/cach-lam-ga-hap-cai-thia-thom-ngon-ga-mem-ngot-thit-1264016',NULL,4,TRUE,NOW(3),NOW(3)),
('dish_bo1_td3_6','combo_bo1_td3','Đĩa trái cây tươi','https://www.bachhoaxanh.com/trai-cay-tuoi-ngon',NULL,5,TRUE,NOW(3),NOW(3)),
('dish_bo1_td3_7','combo_bo1_td3','Chè nhãn nhục','https://www.bachhoaxanh.com/kinh-nghiem-hay/cach-nau-che-nhan-nhuc-thom-mat-997836',NULL,6,TRUE,NOW(3),NOW(3)),
('dish_bo1_td4_1','combo_bo1_td4','Há cảo tôm hấp và chạo cá chiên','https://www.bachhoaxanh.com/kinh-nghiem-hay/cach-lam-ha-cao-tom-thit-deo-mem-vua-an-1180890',NULL,0,TRUE,NOW(3),NOW(3)),
('dish_bo1_td4_2','combo_bo1_td4','Miến xào hải sản','https://www.bachhoaxanh.com/kinh-nghiem-hay/cach-lam-mien-xao-hai-san-toi-ngon-khong-bi-dinh-1378010',NULL,1,TRUE,NOW(3),NOW(3)),
('dish_bo1_td4_3','combo_bo1_td4','Bò cuộn phô mai','https://www.bachhoaxanh.com/kinh-nghiem-hay/cach-lam-bo-cuon-pho-mai-chien-thom-lung-beo-ngay-ai-cung-me-1419573',NULL,2,TRUE,NOW(3),NOW(3)),
('dish_bo1_td4_4','combo_bo1_td4','Súp cua','https://www.bachhoaxanh.com/kinh-nghiem-hay/bo-tui-ngay-cach-nau-sup-cua-an-sang-nhanh-gon-khong-bi-chay-nuoc-1300089',NULL,3,TRUE,NOW(3),NOW(3)),
('dish_bo1_td4_5','combo_bo1_td4','Lườn ngỗng áp chảo sốt tiêu',NULL,NULL,4,TRUE,NOW(3),NOW(3)),
('dish_bo1_td4_6','combo_bo1_td4','Rau câu thập cẩm',NULL,NULL,5,TRUE,NOW(3),NOW(3)),
('dish_bo1_td4_7','combo_bo1_td4','Chè đậu xanh','https://www.bachhoaxanh.com/kinh-nghiem-hay/cach-nau-che-dau-xanh-pho-tai-thom-ngon-de-lam-1001591',NULL,6,TRUE,NOW(3),NOW(3)),
('dish_bo1_td5_1','combo_bo1_td5','Súp cua nấm tuyết',NULL,NULL,0,TRUE,NOW(3),NOW(3)),
('dish_bo1_td5_2','combo_bo1_td5','Gà nấu lagu và bánh mì','https://www.bachhoaxanh.com/kinh-nghiem-hay/doi-mon-voi-lagu-ga-cham-banh-mi-cuc-hap-dan-1139152',NULL,1,TRUE,NOW(3),NOW(3)),
('dish_bo1_td5_3','combo_bo1_td5','Bò né bánh đa',NULL,NULL,2,TRUE,NOW(3),NOW(3)),
('dish_bo1_td5_4','combo_bo1_td5','Lẩu cá lăng măng chua và bún','https://www.bachhoaxanh.com/kinh-nghiem-hay/cuoi-tuan-vao-bep-lam-mon-lau-ca-lang-bong-so-dua-cho-ca-nha-cung-thuong-thuc-1315782',NULL,3,TRUE,NOW(3),NOW(3)),
('dish_bo1_td5_5','combo_bo1_td5','Cá diêu hồng hấp Hồng Kông','https://www.bachhoaxanh.com/kinh-nghiem-hay/cach-lam-ca-dieu-hong-hap-hong-kong-ngon-chuan-vi-nha-hang-1383037',NULL,4,TRUE,NOW(3),NOW(3)),
('dish_bo1_td5_6','combo_bo1_td5','Chè khúc bạch',NULL,NULL,5,TRUE,NOW(3),NOW(3)),
('dish_bo1_td5_7','combo_bo1_td5','Rau câu trái cây',NULL,NULL,6,TRUE,NOW(3),NOW(3))
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `reference_url` = VALUES(`reference_url`), `sort_order` = VALUES(`sort_order`), `is_active` = TRUE, `updated_at` = NOW(3);

INSERT INTO `menu_dishes` (`id`, `combo_id`, `name`, `reference_url`, `description`, `sort_order`, `is_active`, `created_at`, `updated_at`) VALUES
('dish_bo2_td1_1','combo_bo2_td1','Gỏi ngó sen tôm thịt và bánh phồng',NULL,NULL,0,TRUE,NOW(3),NOW(3)),
('dish_bo2_td1_2','combo_bo2_td1','Súp cua đồng',NULL,NULL,1,TRUE,NOW(3),NOW(3)),
('dish_bo2_td1_3','combo_bo2_td1','Gà hấp lá chanh',NULL,NULL,2,TRUE,NOW(3),NOW(3)),
('dish_bo2_td1_4','combo_bo2_td1','Cá rô kho tộ','https://www.bachhoaxanh.com/kinh-nghiem-hay/cach-lam-ca-ro-kho-to-khong-bi-tanh-mau-sac-dep-nhin-la-doi-bung-ngay-1199507',NULL,3,TRUE,NOW(3),NOW(3)),
('dish_bo2_td1_5','combo_bo2_td1','Mực nhồi thịt hấp xì dầu',NULL,NULL,4,TRUE,NOW(3),NOW(3)),
('dish_bo2_td1_6','combo_bo2_td1','Tôm rang me','https://www.bachhoaxanh.com/kinh-nghiem-hay/cach-lam-tom-tit-rang-me-chua-ngot-hap-dan-an-la-ghien-ngay-1323400',NULL,5,TRUE,NOW(3),NOW(3)),
('dish_bo2_td1_7','combo_bo2_td1','Lẩu thập cẩm và bún tươi',NULL,NULL,6,TRUE,NOW(3),NOW(3)),
('dish_bo2_td1_8','combo_bo2_td1','Chè khoai môn','https://www.bachhoaxanh.com/kinh-nghiem-hay/cac-cach-nau-che-khoai-mon-thom-ngon-don-gian-tai-nha-1407289',NULL,7,TRUE,NOW(3),NOW(3)),
('dish_bo2_td2_1','combo_bo2_td2','Gỏi bắp bò trộn rau răm','https://www.bachhoaxanh.com/kinh-nghiem-hay/lam-mon-goi-bo-rau-ram-thom-ngon-la-mieng-thit-bo-mem-khong-bi-dai-1330350',NULL,0,TRUE,NOW(3),NOW(3)),
('dish_bo2_td2_2','combo_bo2_td2','Súp bào ngư','https://www.bachhoaxanh.com/kinh-nghiem-hay/3-cach-nau-sup-bao-ngu-thom-ngon-bo-duong-cho-gia-dinh-1377616',NULL,1,TRUE,NOW(3),NOW(3)),
('dish_bo2_td2_3','combo_bo2_td2','Gà luộc nguyên con','https://www.bachhoaxanh.com/kinh-nghiem-hay/mach-chi-em-3-cach-luoc-ga-chuan-chi-thit-ga-mem-ngot-lai-khong-bi-rach-da-1283932',NULL,2,TRUE,NOW(3),NOW(3)),
('dish_bo2_td2_4','combo_bo2_td2','Cá chép om dưa','https://www.bachhoaxanh.com/kinh-nghiem-hay/cong-thuc-lam-mon-ca-chep-om-dua-chua-cuc-chuan-cuc-ngon-cua-anh-dat-1225886',NULL,3,TRUE,NOW(3),NOW(3)),
('dish_bo2_td2_5','combo_bo2_td2','Bò xào lăn','https://www.bachhoaxanh.com/kinh-nghiem-hay/cach-lam-mon-bo-xao-lan-don-gian-thom-ngon-het-say-1568354',NULL,4,TRUE,NOW(3),NOW(3)),
('dish_bo2_td2_6','combo_bo2_td2','Tôm nướng muối ớt','https://www.bachhoaxanh.com/kinh-nghiem-hay/tuyet-chieu-giup-mon-tom-nuong-muoi-ot-them-ngon-975586',NULL,5,TRUE,NOW(3),NOW(3)),
('dish_bo2_td2_7','combo_bo2_td2','Lẩu cua đồng và bún','https://www.bachhoaxanh.com/kinh-nghiem-hay/cach-nau-lau-cua-dong-mien-nam-ngon-chuan-vi-cho-bua-tiec-cuoi-tuan-1210128',NULL,6,TRUE,NOW(3),NOW(3)),
('dish_bo2_td2_8','combo_bo2_td2','Chè đậu xanh',NULL,NULL,7,TRUE,NOW(3),NOW(3)),
('dish_bo2_td3_1','combo_bo2_td3','Gỏi ngó sen tôm thịt',NULL,NULL,0,TRUE,NOW(3),NOW(3)),('dish_bo2_td3_2','combo_bo2_td3','Súp vi cá',NULL,NULL,1,TRUE,NOW(3),NOW(3)),('dish_bo2_td3_3','combo_bo2_td3','Gà hấp nấm hương',NULL,NULL,2,TRUE,NOW(3),NOW(3)),('dish_bo2_td3_4','combo_bo2_td3','Cá rô kho tộ',NULL,NULL,3,TRUE,NOW(3),NOW(3)),('dish_bo2_td3_5','combo_bo2_td3','Bò xào sả ớt','https://www.bachhoaxanh.com/kinh-nghiem-hay/cach-lam-bo-xao-sa-ot-cay-nong-ngon-kho-cuong-1209415',NULL,4,TRUE,NOW(3),NOW(3)),('dish_bo2_td3_6','combo_bo2_td3','Tôm rang muối','https://www.bachhoaxanh.com/kinh-nghiem-hay/3-cach-lam-tom-rang-muoi-ngon-gion-dam-vi-de-lam-tai-nha-1420524',NULL,5,TRUE,NOW(3),NOW(3)),('dish_bo2_td3_7','combo_bo2_td3','Lẩu nấm hải sản',NULL,NULL,6,TRUE,NOW(3),NOW(3)),('dish_bo2_td3_8','combo_bo2_td3','Chè khoai môn',NULL,NULL,7,TRUE,NOW(3),NOW(3)),
('dish_bo2_td4_1','combo_bo2_td4','Gỏi bắp bò',NULL,NULL,0,TRUE,NOW(3),NOW(3)),('dish_bo2_td4_2','combo_bo2_td4','Súp cua',NULL,NULL,1,TRUE,NOW(3),NOW(3)),('dish_bo2_td4_3','combo_bo2_td4','Gà luộc',NULL,NULL,2,TRUE,NOW(3),NOW(3)),('dish_bo2_td4_4','combo_bo2_td4','Cá chép om dưa',NULL,NULL,3,TRUE,NOW(3),NOW(3)),('dish_bo2_td4_5','combo_bo2_td4','Bò xào lăn',NULL,NULL,4,TRUE,NOW(3),NOW(3)),('dish_bo2_td4_6','combo_bo2_td4','Tôm nướng',NULL,NULL,5,TRUE,NOW(3),NOW(3)),('dish_bo2_td4_7','combo_bo2_td4','Lẩu hải sản',NULL,NULL,6,TRUE,NOW(3),NOW(3)),('dish_bo2_td4_8','combo_bo2_td4','Chè đậu xanh',NULL,NULL,7,TRUE,NOW(3),NOW(3)),
('dish_bo2_td5_1','combo_bo2_td5','Gỏi ngó sen',NULL,NULL,0,TRUE,NOW(3),NOW(3)),('dish_bo2_td5_2','combo_bo2_td5','Súp bào ngư',NULL,NULL,1,TRUE,NOW(3),NOW(3)),('dish_bo2_td5_3','combo_bo2_td5','Gà hấp lá chanh',NULL,NULL,2,TRUE,NOW(3),NOW(3)),('dish_bo2_td5_4','combo_bo2_td5','Cá rô kho tộ',NULL,NULL,3,TRUE,NOW(3),NOW(3)),('dish_bo2_td5_5','combo_bo2_td5','Bò xào sả ớt',NULL,NULL,4,TRUE,NOW(3),NOW(3)),('dish_bo2_td5_6','combo_bo2_td5','Tôm rang muối',NULL,NULL,5,TRUE,NOW(3),NOW(3)),('dish_bo2_td5_7','combo_bo2_td5','Lẩu nấm',NULL,NULL,6,TRUE,NOW(3),NOW(3)),('dish_bo2_td5_8','combo_bo2_td5','Chè khoai môn',NULL,NULL,7,TRUE,NOW(3),NOW(3)),
('dish_bo3_td1_1','combo_bo3_td1','Gỏi ngó sen',NULL,NULL,0,TRUE,NOW(3),NOW(3)),('dish_bo3_td1_2','combo_bo3_td1','Súp hải sản','https://www.bachhoaxanh.com/kinh-nghiem-hay/cach-nau-sup-hai-san-thom-ngon-bo-duong-cho-ca-gia-dinh-1234859',NULL,1,TRUE,NOW(3),NOW(3)),('dish_bo3_td1_3','combo_bo3_td1','Gà xào sả ớt','https://www.bachhoaxanh.com/kinh-nghiem-hay/cach-lam-ga-xao-sa-ot-cay-thom-nong-ngon-mieng-tai-nha-1335523',NULL,2,TRUE,NOW(3),NOW(3)),('dish_bo3_td1_4','combo_bo3_td1','Tôm hấp sả','https://www.bachhoaxanh.com/kinh-nghiem-hay/cach-lam-tom-hap-sa-thom-nut-mui-thit-ngon-ngot-1211700',NULL,3,TRUE,NOW(3),NOW(3)),('dish_bo3_td1_5','combo_bo3_td1','Cá nướng mắm me',NULL,NULL,4,TRUE,NOW(3),NOW(3)),('dish_bo3_td1_6','combo_bo3_td1','Bò cuốn lá lốt','https://www.bachhoaxanh.com/kinh-nghiem-hay/cach-lam-bo-nuong-la-lot-thom-lung-hap-dan-964066',NULL,5,TRUE,NOW(3),NOW(3)),('dish_bo3_td1_7','combo_bo3_td1','Lẩu cá lóc chua cay và bún tươi','https://www.bachhoaxanh.com/kinh-nghiem-hay/bi-quyet-lam-lau-ca-loc-chua-cay-dam-da-thom-ngon-don-gian-tai-nha-1375183',NULL,6,TRUE,NOW(3),NOW(3)),('dish_bo3_td1_8','combo_bo3_td1','Chè bắp','https://www.bachhoaxanh.com/kinh-nghiem-hay/cach-lam-che-bap-ngon-tuyet-930195',NULL,7,TRUE,NOW(3),NOW(3)),
('dish_bo3_td2_1','combo_bo3_td2','Gỏi bắp bò',NULL,NULL,0,TRUE,NOW(3),NOW(3)),('dish_bo3_td2_2','combo_bo3_td2','Súp cua',NULL,NULL,1,TRUE,NOW(3),NOW(3)),('dish_bo3_td2_3','combo_bo3_td2','Gà quay','https://www.bachhoaxanh.com/kinh-nghiem-hay/cach-lam-ga-quay-da-gion-bang-noi-chien-khong-dau-sieu-de-1403052',NULL,2,TRUE,NOW(3),NOW(3)),('dish_bo3_td2_4','combo_bo3_td2','Cá chẽm sốt Tứ Xuyên',NULL,NULL,3,TRUE,NOW(3),NOW(3)),('dish_bo3_td2_5','combo_bo3_td2','Bò xào sả ớt',NULL,NULL,4,TRUE,NOW(3),NOW(3)),('dish_bo3_td2_6','combo_bo3_td2','Tôm nướng',NULL,NULL,5,TRUE,NOW(3),NOW(3)),('dish_bo3_td2_7','combo_bo3_td2','Lẩu hải sản',NULL,NULL,6,TRUE,NOW(3),NOW(3)),('dish_bo3_td2_8','combo_bo3_td2','Chè đậu xanh',NULL,NULL,7,TRUE,NOW(3),NOW(3)),
('dish_bo3_td3_1','combo_bo3_td3','Nộm hoa chuối tai lợn','https://www.bachhoaxanh.com/kinh-nghiem-hay/lam-nom-hoa-chuoi-tai-heo-khong-tham-gion-ngon-doi-vi-cho-bua-an-gia-dinh-1372370',NULL,0,TRUE,NOW(3),NOW(3)),('dish_bo3_td3_2','combo_bo3_td3','Salad dầu giấm','https://www.bachhoaxanh.com/kinh-nghiem-hay/huong-dan-lam-mon-salad-dau-giam-thom-ngon-bo-duong-de-lam-tai-nha-1373466',NULL,1,TRUE,NOW(3),NOW(3)),('dish_bo3_td3_3','combo_bo3_td3','Mực hấp hành','https://www.bachhoaxanh.com/kinh-nghiem-hay/bo-tui-2-cong-thuc-lam-muc-hap-hanh-thom-lung-cho-bua-com-gia-dinh-1396117',NULL,2,TRUE,NOW(3),NOW(3)),('dish_bo3_td3_4','combo_bo3_td3','Tôm hấp tại bàn',NULL,NULL,3,TRUE,NOW(3),NOW(3)),('dish_bo3_td3_5','combo_bo3_td3','Gà xào sả ớt',NULL,NULL,4,TRUE,NOW(3),NOW(3)),('dish_bo3_td3_6','combo_bo3_td3','Bánh tráng cuốn thịt luộc','https://www.bachhoaxanh.com/kinh-nghiem-hay/cach-lam-banh-trang-cuon-thit-heo-ngon-dung-dieu-1371901',NULL,5,TRUE,NOW(3),NOW(3)),('dish_bo3_td3_7','combo_bo3_td3','Canh chua cá bớp','https://www.bachhoaxanh.com/kinh-nghiem-hay/cach-nau-canh-chua-ca-bop-ngon-khong-bi-tanh-1224064',NULL,6,TRUE,NOW(3),NOW(3)),('dish_bo3_td3_8','combo_bo3_td3','Chè hạt sen','https://www.bachhoaxanh.com/kinh-nghiem-hay/cach-nau-che-hat-sen-voi-duong-phen-thanh-mat-cuc-don-gian-993654',NULL,7,TRUE,NOW(3),NOW(3)),
('dish_bo3_td4_1','combo_bo3_td4','Gỏi gà','https://www.bachhoaxanh.com/kinh-nghiem-hay/tong-hop-9-cach-lam-goi-ga-ngon-nhat-cho-bua-com-gia-dinh-1419478',NULL,0,TRUE,NOW(3),NOW(3)),('dish_bo3_td4_2','combo_bo3_td4','Nộm rau câu hải sản',NULL,NULL,1,TRUE,NOW(3),NOW(3)),('dish_bo3_td4_3','combo_bo3_td4','Canh chua cá lóc',NULL,NULL,2,TRUE,NOW(3),NOW(3)),('dish_bo3_td4_4','combo_bo3_td4','Bò sốt tiêu đen kèm bánh bao','https://www.bachhoaxanh.com/kinh-nghiem-hay/cach-lam-mon-thit-bo-sot-tieu-den-mem-ngon-cuc-hao-com-1373426',NULL,3,TRUE,NOW(3),NOW(3)),('dish_bo3_td4_5','combo_bo3_td4','Lẩu hải sản',NULL,NULL,4,TRUE,NOW(3),NOW(3)),('dish_bo3_td4_6','combo_bo3_td4','Tôm sú rang muối',NULL,NULL,5,TRUE,NOW(3),NOW(3)),('dish_bo3_td4_7','combo_bo3_td4','Trái cây theo mùa',NULL,NULL,6,TRUE,NOW(3),NOW(3)),
('dish_bo3_td5_1','combo_bo3_td5','Nộm hoa chuối','https://www.bachhoaxanh.com/kinh-nghiem-hay/cach-lam-nom-hoa-chuoi-da-heo-gion-tan-thom-phuc-de-lam-tai-nha-1379079',NULL,0,TRUE,NOW(3),NOW(3)),('dish_bo3_td5_2','combo_bo3_td5','Chân giò hầm đậu đỏ','https://www.bachhoaxanh.com/kinh-nghiem-hay/cach-lam-chan-gio-ham-dau-do-beo-bui-tam-bo-cho-ca-nha-1581802',NULL,1,TRUE,NOW(3),NOW(3)),('dish_bo3_td5_3','combo_bo3_td5','Cá lóc nướng trui','https://www.bachhoaxanh.com/kinh-nghiem-hay/cach-lam-mon-ca-loc-nuong-trui-dan-da-dac-san-mien-tay-1372928',NULL,2,TRUE,NOW(3),NOW(3)),('dish_bo3_td5_4','combo_bo3_td5','Tôm cuộn phô mai',NULL,NULL,3,TRUE,NOW(3),NOW(3)),('dish_bo3_td5_5','combo_bo3_td5','Gà nướng mật ong','https://www.bachhoaxanh.com/kinh-nghiem-hay/cach-lam-dui-ga-nuong-mat-ong-thom-lung-ca-gian-bep-tre-nho-va-nguoi-lon-deu-me-1265231',NULL,4,TRUE,NOW(3),NOW(3)),('dish_bo3_td5_6','combo_bo3_td5','Canh hải sản',NULL,NULL,5,TRUE,NOW(3),NOW(3)),('dish_bo3_td5_7','combo_bo3_td5','Chè đậu xanh',NULL,NULL,6,TRUE,NOW(3),NOW(3))
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `reference_url` = VALUES(`reference_url`), `sort_order` = VALUES(`sort_order`), `is_active` = TRUE, `updated_at` = NOW(3);

INSERT INTO `package_images` (`id`, `package_id`, `url`, `alt_text`, `sort_order`, `is_cover`, `created_at`, `updated_at`) VALUES
('gallery_economy_1', 'pkg_economy', 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1600&q=85', 'Ảnh đại diện gói Tiết kiệm', 0, TRUE, NOW(3), NOW(3)),
('gallery_economy_2', 'pkg_economy', 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1600&q=85', 'Cặp đôi trong không gian tiệc cưới', 1, FALSE, NOW(3), NOW(3)),
('gallery_economy_3', 'pkg_economy', 'https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?auto=format&fit=crop&w=1600&q=85', 'Bàn tiệc cưới được trang trí tinh tế', 2, FALSE, NOW(3), NOW(3)),
('gallery_economy_4', 'pkg_economy', 'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=1600&q=85', 'Không gian lễ cưới trang trọng', 3, FALSE, NOW(3), NOW(3)),
('gallery_traditional_1', 'pkg_traditional', 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=85', 'Ảnh đại diện gói Truyền thống', 0, TRUE, NOW(3), NOW(3)),
('gallery_traditional_2', 'pkg_traditional', 'https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?auto=format&fit=crop&w=1600&q=85', 'Bàn tiệc cưới truyền thống', 1, FALSE, NOW(3), NOW(3)),
('gallery_traditional_3', 'pkg_traditional', 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1600&q=85', 'Hoa trang trí trong ngày cưới', 2, FALSE, NOW(3), NOW(3)),
('gallery_traditional_4', 'pkg_traditional', 'https://images.unsplash.com/photo-1494955870715-979ca4f13bf0?auto=format&fit=crop&w=1600&q=85', 'Khoảnh khắc trong lễ cưới', 3, FALSE, NOW(3), NOW(3)),
('gallery_rustic_1', 'pkg_rustic', 'https://images.unsplash.com/photo-1507504031003-b417219a0fde?auto=format&fit=crop&w=1600&q=85', 'Ảnh đại diện gói Rustic', 0, TRUE, NOW(3), NOW(3)),
('gallery_rustic_2', 'pkg_rustic', 'https://images.unsplash.com/photo-1505944357431-27579db47558?auto=format&fit=crop&w=1600&q=85', 'Trang trí tiệc cưới ngoài trời', 1, FALSE, NOW(3), NOW(3)),
('gallery_rustic_3', 'pkg_rustic', 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1600&q=85', 'Không gian cưới gần gũi thiên nhiên', 2, FALSE, NOW(3), NOW(3)),
('gallery_rustic_4', 'pkg_rustic', 'https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?auto=format&fit=crop&w=1600&q=85', 'Bàn tiệc phong cách mộc', 3, FALSE, NOW(3), NOW(3)),
('gallery_modern_1', 'pkg_modern', 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1600&q=85', 'Ảnh đại diện gói Hiện đại', 0, TRUE, NOW(3), NOW(3)),
('gallery_modern_2', 'pkg_modern', 'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=1600&q=85', 'Không gian lễ cưới hiện đại', 1, FALSE, NOW(3), NOW(3)),
('gallery_modern_3', 'pkg_modern', 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1600&q=85', 'Hoa và ánh sáng trang trí', 2, FALSE, NOW(3), NOW(3)),
('gallery_modern_4', 'pkg_modern', 'https://images.unsplash.com/photo-1494955870715-979ca4f13bf0?auto=format&fit=crop&w=1600&q=85', 'Khoảnh khắc lễ cưới hiện đại', 3, FALSE, NOW(3), NOW(3)),
('gallery_vip_1', 'pkg_vip', 'https://images.unsplash.com/photo-1544078751-58fee2d8a03b?auto=format&fit=crop&w=1600&q=85', 'Ảnh đại diện gói VIP', 0, TRUE, NOW(3), NOW(3)),
('gallery_vip_2', 'pkg_vip', 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1600&q=85', 'Không gian cưới cao cấp', 1, FALSE, NOW(3), NOW(3)),
('gallery_vip_3', 'pkg_vip', 'https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?auto=format&fit=crop&w=1600&q=85', 'Bàn tiệc VIP sang trọng', 2, FALSE, NOW(3), NOW(3)),
('gallery_vip_4', 'pkg_vip', 'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=1600&q=85', 'Sân khấu và sảnh cưới cao cấp', 3, FALSE, NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE
  `url` = VALUES(`url`),
  `alt_text` = VALUES(`alt_text`),
  `sort_order` = VALUES(`sort_order`),
  `updated_at` = NOW(3);

UPDATE `menu_dishes`
SET `image_url` = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=85'
WHERE `image_url` IS NULL;

INSERT INTO `catalog_items` (`id`, `name`, `type`, `description`, `unit`, `unit_price`, `is_active`, `created_at`, `updated_at`) VALUES
('catalog_tent', 'Rạp cưới', 'EQUIPMENT', 'Rạp cưới chắc chắn, phù hợp không gian tại gia.', 'bộ', 6000000, TRUE, NOW(3), NOW(3)),
('catalog_tables', 'Bàn ghế', 'EQUIPMENT', 'Bàn ghế kèm áo ghế và nơ trang trí.', 'bàn', 350000, TRUE, NOW(3), NOW(3)),
('catalog_ancestor', 'Bàn gia tiên', 'DECORATION', 'Trang trí bàn gia tiên đồng bộ.', 'bộ', 3500000, TRUE, NOW(3), NOW(3)),
('catalog_flowers', 'Hoa trang trí', 'DECORATION', 'Hoa tươi và hoa cao cấp theo chủ đề.', 'gói', 4500000, TRUE, NOW(3), NOW(3)),
('catalog_stage', 'Sân khấu', 'EQUIPMENT', 'Sân khấu, phông nền và bảng tên.', 'bộ', 5000000, TRUE, NOW(3), NOW(3)),
('catalog_sound', 'Âm thanh', 'SERVICE', 'Hệ thống âm thanh và kỹ thuật viên.', 'gói', 4000000, TRUE, NOW(3), NOW(3)),
('catalog_light', 'Ánh sáng', 'SERVICE', 'Ánh sáng sân khấu và không gian.', 'gói', 3000000, TRUE, NOW(3), NOW(3)),
('catalog_mc', 'MC', 'SERVICE', 'MC dẫn chương trình tiệc cưới.', 'ca', 2500000, TRUE, NOW(3), NOW(3)),
('catalog_photo', 'Chụp ảnh', 'SERVICE', 'Nhiếp ảnh gia và album ảnh số.', 'gói', 5000000, TRUE, NOW(3), NOW(3)),
('catalog_video', 'Quay phim', 'SERVICE', 'Quay phim và video highlight.', 'gói', 6500000, TRUE, NOW(3), NOW(3)),
('catalog_starter', 'Món khai vị', 'FOOD', 'Khai vị theo thực đơn đã chọn.', 'bàn', 450000, TRUE, NOW(3), NOW(3)),
('catalog_main', 'Món chính', 'FOOD', 'Thực đơn món chính cho một bàn.', 'bàn', 2200000, TRUE, NOW(3), NOW(3)),
('catalog_dessert', 'Món tráng miệng', 'FOOD', 'Trái cây hoặc chè tráng miệng.', 'bàn', 300000, TRUE, NOW(3), NOW(3)),
('catalog_drink', 'Nước uống', 'FOOD', 'Nước ngọt và nước suối.', 'bàn', 300000, TRUE, NOW(3), NOW(3)),
('catalog_food_drink', 'Đồ ăn và thức uống', 'FOOD', 'Hạng mục đồ ăn và thức uống được chọn theo combo.', 'gói', 3250000, TRUE, NOW(3), NOW(3)),
('catalog_transport', 'Vận chuyển', 'TRANSPORT', 'Vận chuyển trong bán kính tiêu chuẩn.', 'chuyến', 2000000, TRUE, NOW(3), NOW(3)),
('catalog_service', 'Phục vụ', 'SERVICE', 'Nhân viên phục vụ tiệc.', 'nhân viên', 500000, TRUE, NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE
  `description` = VALUES(`description`),
  `unit` = VALUES(`unit`),
  `unit_price` = VALUES(`unit_price`),
  `is_active` = TRUE,
  `updated_at` = NOW(3);

UPDATE `catalog_items` SET `is_active` = FALSE WHERE `id` IN ('catalog_starter', 'catalog_main', 'catalog_dessert', 'catalog_drink');

INSERT INTO `package_catalog_items` (`id`, `package_id`, `catalog_item_id`, `quantity`, `is_required`)
SELECT
  CONCAT('pci_', `p`.`id`, '_', `c`.`id`),
  `p`.`id`,
  `c`.`id`,
  1,
  TRUE
FROM `wedding_packages` AS `p`
CROSS JOIN `catalog_items` AS `c`
WHERE `p`.`slug` IN ('goi-tiet-kiem', 'goi-truyen-thong', 'goi-rustic', 'goi-hien-dai', 'goi-vip')
  AND `c`.`id` IN ('catalog_tent', 'catalog_tables', 'catalog_flowers', 'catalog_stage', 'catalog_sound', 'catalog_food_drink')
ON DUPLICATE KEY UPDATE
  `quantity` = VALUES(`quantity`),
  `is_required` = FALSE;

INSERT INTO `staff_rates` (`id`, `job_name`, `description`, `amount`, `is_active`, `created_at`, `updated_at`) VALUES
('rate_build_tent', 'Dựng rạp', 'Thi công dựng rạp cưới', 500000, TRUE, NOW(3), NOW(3)),
('rate_remove_tent', 'Tháo rạp', 'Tháo dỡ và bàn giao mặt bằng', 500000, TRUE, NOW(3), NOW(3)),
('rate_ancestor', 'Trang trí gia tiên', 'Trang trí khu vực gia tiên', 700000, TRUE, NOW(3), NOW(3)),
('rate_stage', 'Trang trí sân khấu', 'Trang trí sân khấu và phông nền', 800000, TRUE, NOW(3), NOW(3)),
('rate_sound', 'Âm thanh ánh sáng', 'Vận hành âm thanh và ánh sáng', 900000, TRUE, NOW(3), NOW(3)),
('rate_photo', 'Chụp ảnh', 'Chụp ảnh sự kiện', 1500000, TRUE, NOW(3), NOW(3)),
('rate_video', 'Quay phim', 'Quay phim sự kiện', 1800000, TRUE, NOW(3), NOW(3)),
('rate_mc', 'MC', 'Dẫn chương trình', 2000000, TRUE, NOW(3), NOW(3)),
('rate_service', 'Phục vụ', 'Phục vụ khách trong tiệc', 450000, TRUE, NOW(3), NOW(3)),
('rate_transport', 'Vận chuyển', 'Vận chuyển thiết bị', 600000, TRUE, NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE
  `description` = VALUES(`description`),
  `amount` = VALUES(`amount`),
  `is_active` = TRUE,
  `updated_at` = NOW(3);

INSERT INTO `chatbot_faqs` (`id`, `question`, `answer`, `keywords`, `is_active`, `created_at`, `updated_at`) VALUES
('faq_deposit', 'Tiền cọc bao nhiêu?', 'Tiền cọc mặc định là 50% tổng giá trị hợp đồng. Khách hàng ký điện tử trước khi thanh toán đặt cọc.', 'tiền cọc,cọc,50%,ký điện tử', TRUE, NOW(3), NOW(3)),
('faq_booking', 'Quy trình đặt tiệc', 'Bạn chọn gói, tùy biến dịch vụ, chọn ngày và địa điểm, xác nhận hợp đồng, sau đó chuyển khoản tiền cọc.', 'quy trình,đặt tiệc,đặt cưới', TRUE, NOW(3), NOW(3)),
('faq_cancel', 'Chính sách hủy', 'Chính sách hủy được ghi rõ trong hợp đồng. Mức hoàn cọc phụ thuộc thời điểm hủy và chỉ được xác nhận bởi quản trị viên.', 'hủy,hoàn cọc', TRUE, NOW(3), NOW(3)),
('faq_menu', 'Chính sách đổi món', 'Bạn có thể điều chỉnh món ăn trước khi hợp đồng được chốt. Giá sẽ được backend tính lại theo danh mục hiện hành.', 'đổi món,món ăn,thực đơn', TRUE, NOW(3), NOW(3)),
('faq_time', 'Thời gian đặt tiệc', 'Nên đặt trước tối thiểu 30 ngày. Khả năng nhận tiệc còn phụ thuộc capacity của ngày cụ thể.', 'đặt trước,thời gian', TRUE, NOW(3), NOW(3)),
('faq_casso', 'Thanh toán bằng Casso', 'Hệ thống dùng Casso để nhận webhook và đối soát giao dịch chuyển khoản. Bạn cần ghi đúng nội dung thanh toán.', 'casso,chuyển khoản,thanh toán', TRUE, NOW(3), NOW(3)),
('faq_acceptance', 'Quy trình nghiệm thu', 'Nhân viên check-in kèm ảnh trước thi công, check-out kèm ảnh sau bàn giao, sau đó quản trị viên duyệt nghiệm thu.', 'nghiệm thu,check-in,check-out', TRUE, NOW(3), NOW(3)),
('faq_damage', 'Chính sách hư hại', 'Hư hại phải có ảnh và mô tả. Quản trị viên xem xét, lập chi phí và xác nhận phương án xử lý.', 'hư hại,bồi thường', TRUE, NOW(3), NOW(3)),
('faq_refund', 'Thời gian hoàn tiền', 'Thời gian hoàn tiền phụ thuộc trạng thái hợp đồng và kết quả đối soát. Quản trị viên sẽ thông báo trên hệ thống.', 'hoàn tiền', TRUE, NOW(3), NOW(3)),
('faq_contract', 'Cách xem hợp đồng', 'Sau khi đăng nhập, mở mục Hợp đồng của tôi để xem chi tiết, thanh toán và tải bản PDF.', 'xem hợp đồng,pdf', TRUE, NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE
  `question` = VALUES(`question`),
  `answer` = VALUES(`answer`),
  `keywords` = VALUES(`keywords`),
  `is_active` = TRUE,
  `updated_at` = NOW(3);

COMMIT;

-- Kiem tra nhanh sau khi import.
SELECT 'Database wedding_management da duoc tao thanh cong.' AS `message`;
SELECT COUNT(*) AS `total_tables`
FROM `information_schema`.`tables`
WHERE `table_schema` = 'wedding_management';

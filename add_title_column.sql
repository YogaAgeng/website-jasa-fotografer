-- Add title column to bookings table
ALTER TABLE `bookings` ADD COLUMN `title` varchar(255) DEFAULT NULL AFTER `client_phone`;

-- Update existing bookings with sample titles
UPDATE `bookings` SET `title` = 'nikahan yoga' WHERE `id` = '30000000-0000-0000-0000-000000000001';

-- Add more sample bookings with titles for testing
INSERT INTO `bookings` (`id`, `client_id`, `package_id`, `staff_id`, `event_date`, `start_at`, `end_at`, `address`, `client_phone`, `title`, `status`, `subtotal`, `discount`, `total`, `dp_amount`, `dp_paid_at`, `created_at`, `updated_at`) VALUES
('30000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', '21000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '2025-09-25', '2025-09-25 10:00:00.000', '2025-09-25 12:00:00.000', 'Studio B, Jakarta', '+6281234567890', 'prewedding andi sari', 'CONFIRMED', 1000000, 0, 1000000, 200000, NULL, '2025-09-12 10:00:00.000', '2025-09-12 10:00:00.000'),
('30000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', '21000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '2025-09-30', '2025-09-30 14:00:00.000', '2025-09-30 16:00:00.000', 'Outdoor Location', '+6281234567891', 'foto produk makanan', 'SCHEDULED', 500000, 0, 500000, 100000, NULL, '2025-09-12 10:00:00.000', '2025-09-12 10:00:00.000');

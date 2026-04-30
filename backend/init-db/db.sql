-- ==========================================
-- 1. BẢNG USERS: Quản lý người dùng & Phân quyền
-- ==========================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,

    -- Phân quyền: Chỉ cho phép nhận giá trị 'admin' hoặc 'employee'
    role VARCHAR(20) NOT NULL DEFAULT 'employee' CHECK (role IN ('admin', 'employee')),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 2. BẢNG FORMS: Quản lý khuôn mẫu biểu mẫu
-- ==========================================
CREATE TABLE forms (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL, -- Người tạo form
    title VARCHAR(255) NOT NULL,
    description TEXT,
    display_order INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Nếu user bị xóa, các form do họ tạo cũng bị xóa theo
    CONSTRAINT fk_form_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Đánh chỉ mục (Index) để tăng tốc độ lấy danh sách form của 1 user
CREATE INDEX idx_forms_user_id ON forms(user_id);

-- ==========================================
-- 3. BẢNG FIELDS: Quản lý các trường thông tin
-- ==========================================
CREATE TABLE fields (
    id SERIAL PRIMARY KEY,
    form_id INT NOT NULL,
    label VARCHAR(255) NOT NULL,

    -- Thêm 'file' vào danh sách các loại hình hợp lệ (Dùng cho upload ảnh/tài liệu)
    field_type VARCHAR(50) NOT NULL CHECK (field_type IN ('text', 'number', 'date', 'color', 'select', 'file')),

    display_order INT DEFAULT 0,
    is_required BOOLEAN DEFAULT FALSE,

    -- Options: Dùng mảng JSONB để lưu danh sách lựa chọn (VD: ["A", "B"])
    options JSONB DEFAULT NULL,

    CONSTRAINT fk_field_form FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE,

    -- RÀNG BUỘC THÉP: Chỉ type='select' mới được có options, các loại khác phải NULL
    CONSTRAINT check_options_logic CHECK (
        (field_type = 'select' AND options IS NOT NULL) OR
        (field_type != 'select' AND options IS NULL)
    )
);

-- Đánh chỉ mục để lấy nhanh toàn bộ fields khi xem chi tiết 1 form
CREATE INDEX idx_fields_form_id ON fields(form_id);

-- ==========================================
-- 4. BẢNG FORM_SUBMISSIONS: Lưu câu trả lời
-- ==========================================
CREATE TABLE form_submissions (
    id SERIAL PRIMARY KEY,
    form_id INT NOT NULL,

    -- Ghi nhận ai là người nộp. Đặt là NULL nếu cho phép người ngoài (không đăng nhập) nộp
    submitter_id INT DEFAULT NULL,

    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Lưu toàn bộ nội dung trả lời vào đây
    answers JSONB NOT NULL,

    CONSTRAINT fk_submission_form FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE,
    CONSTRAINT fk_submission_user FOREIGN KEY (submitter_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Đánh chỉ mục để Admin lấy danh sách câu trả lời của 1 form nhanh hơn
CREATE INDEX idx_submissions_form_id ON form_submissions(form_id);
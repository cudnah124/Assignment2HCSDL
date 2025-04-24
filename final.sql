DROP DATABASE IF EXISTS railway;
CREATE DATABASE IF NOT EXISTS railway;
USE railway;

CREATE TABLE NhanVien (
    MaNV VARCHAR(6) PRIMARY KEY,
    Ho VARCHAR(15) NOT NULL,
    Ten VARCHAR(15) NOT NULL,
    CHECK (CHAR_LENGTH(MaNV) = 6
        AND MaNV LIKE 'NV%')
);

CREATE TABLE DiaChiNV (
    MaDiaChiNV INT AUTO_INCREMENT PRIMARY KEY,
    SoNha VARCHAR(50),
    Duong VARCHAR(50),
    Quan VARCHAR(50),
    ThanhPho VARCHAR(50),
    MaNV VARCHAR(6),
    CONSTRAINT FK_DiaChiNV_MaNV FOREIGN KEY (MaNV)
        REFERENCES NhanVien (MaNV)
        ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE SDT_NhanVien (
    MaNV VARCHAR(6),
    SDT VARCHAR(11),
    PRIMARY KEY (MaNV , SDT),
    CONSTRAINT FK_SDTNV_MaNV FOREIGN KEY (MaNV)
        REFERENCES NhanVien (MaNV)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT chk_sdtnv_format CHECK (SDT REGEXP '^[0-9]{10,11}$')
);

CREATE TABLE Email_NhanVien (
    MaNV VARCHAR(6),
    Email VARCHAR(50),
    PRIMARY KEY (MaNV , Email),
    CONSTRAINT FK_EmailNV_MaNV FOREIGN KEY (MaNV)
        REFERENCES NhanVien (MaNV)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT chk_emailnv_format CHECK (Email REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE TABLE CaLam (
    MaCa VARCHAR(5) PRIMARY KEY,
    NgayLam DATE NOT NULL,
    GioLam TIME NOT NULL,
    GioTan TIME NOT NULL,
    CHECK (GioLam < GioTan)
);

CREATE TABLE NV_Lam (
    MaNV VARCHAR(6),
    MaCa VARCHAR(5),
    PRIMARY KEY (MaNV , MaCa),
    CONSTRAINT FK_NVLam_MaNV FOREIGN KEY (MaNV)
        REFERENCES NhanVien (MaNV)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT FK_NVLam_CaLam FOREIGN KEY (MaCa)
        REFERENCES CaLam (MaCa)
        ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE KhachHang (
    MaKH INT AUTO_INCREMENT PRIMARY KEY,
    Ho VARCHAR(15) NOT NULL,
    Ten VARCHAR(15) NOT NULL,
    DiemTichLuy INT DEFAULT 0 CHECK (DiemTichLuy >= 0),
    -- This is a generated column (read-only)
    LoaiThanhVien VARCHAR(20) GENERATED ALWAYS AS (
        CASE
            WHEN DiemTichLuy >= 5000 THEN 'Vàng'
            WHEN DiemTichLuy >= 1000 THEN 'Bạc'
            ELSE 'Cơ bản'
        END
    ) STORED
);

CREATE TABLE SDT_KhachHang (
    MaKH INT,
    SDT VARCHAR(11),
    PRIMARY KEY (MaKH , SDT),
    CONSTRAINT FK_SDTKhachHang_MaKH FOREIGN KEY (MaKH)
        REFERENCES KhachHang (MaKH)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT chk_sdt_kh_format CHECK (SDT REGEXP '^[0-9]{10,11}$')
);

CREATE TABLE DonHang (
    MaDonHang INT AUTO_INCREMENT PRIMARY KEY,
    TrangThai ENUM('Pending', 'Preparing', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Pending',
    MaNV VARCHAR(6),
    MaKH INT,
    NgayGioTao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_NhanVien_XuLy_DonHang FOREIGN KEY (MaNV)
        REFERENCES NhanVien (MaNV)
        ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT FK_KhachHang_Dat_DonHang FOREIGN KEY (MaKH)
        REFERENCES KhachHang (MaKH)
        ON UPDATE CASCADE ON DELETE RESTRICT
);


CREATE TABLE NhaCungCap (
    MaNCC VARCHAR(6) PRIMARY KEY,
    TenNCC VARCHAR(50) NOT NULL,
    MaSoThue VARCHAR(13) UNIQUE NOT NULL,
    CHECK (CHAR_LENGTH(MaNCC) = 6
        AND MaNCC LIKE 'NC%')
);

CREATE TABLE DiaChiNCC (
    MaDiaChiNCC INT AUTO_INCREMENT PRIMARY KEY,
    SoNha VARCHAR(50),
    Duong VARCHAR(50),
    Quan VARCHAR(50),
    ThanhPho VARCHAR(50),
    MaNCC VARCHAR(6),
    CONSTRAINT FK_DiaChiNCC_MaNCC FOREIGN KEY (MaNCC)
        REFERENCES NhaCungCap (MaNCC)
        ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE SDT_NCC (
    MaNCC VARCHAR(6),
    SDT VARCHAR(11),
    PRIMARY KEY (MaNCC , SDT),
    CONSTRAINT FK_SDTNCC_MaNCC FOREIGN KEY (MaNCC)
        REFERENCES NhaCungCap (MaNCC)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT chk_sdtncc_format CHECK (SDT REGEXP '^[0-9]{10,11}$')
);

CREATE TABLE Email_NCC (
    MaNCC VARCHAR(6),
    Email VARCHAR(50),
    PRIMARY KEY (MaNCC , Email),
    CONSTRAINT FK_EmailNCC_MaNCC FOREIGN KEY (MaNCC)
        REFERENCES NhaCungCap (MaNCC)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT chk_emailncc_format CHECK (Email REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE TABLE DonNhapHang (
    MaDon INT AUTO_INCREMENT PRIMARY KEY,
    NgayNhap DATE NOT NULL DEFAULT (CURRENT_DATE),
    MaNV VARCHAR(6),
    MaNCC VARCHAR(6),

    CONSTRAINT FK_NhanVien_XuLy_DonNhapHang FOREIGN KEY (MaNV) 
		REFERENCES NhanVien(MaNV)
        ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT FK_NhaCungCap_CungCap_DonNhapHang FOREIGN KEY (MaNCC) 
		REFERENCES NhaCungCap(MaNCC)
        ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE NguyenLieu (
    MaNguyenLieu VARCHAR(10) PRIMARY KEY,
    TenNguyenLieu VARCHAR(50) NOT NULL,
    MoTa TEXT,
    DonGia DECIMAL(10 , 2 ) NOT NULL CHECK (DonGia > 0),
    TonKho INT NOT NULL DEFAULT 0 CHECK (TonKho >= 0),
    DonViTinh VARCHAR(12) NOT NULL
);

CREATE TABLE Menu (
    MaMon VARCHAR(10) PRIMARY KEY,
    TenMon VARCHAR(50) NOT NULL
);

CREATE TABLE NuocUong (
    MaMon VARCHAR(10) PRIMARY KEY,
    CONSTRAINT FK_NuocUong_MaMon FOREIGN KEY (MaMon)
        REFERENCES Menu (MaMon)
        ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE KichThuocDoUong (
    KichThuoc CHAR(1) CHECK (KichThuoc IN ('S' , 'M', 'L')),
    Gia DECIMAL(10 , 2 ) NOT NULL CHECK (Gia > 0),
    MaMon VARCHAR(10) NOT NULL,
    PRIMARY KEY (KichThuoc , MaMon),
    CONSTRAINT FK_KichThuocDoUong_MaMon FOREIGN KEY (MaMon)
        REFERENCES NuocUong (MaMon)
        ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE GomDH_NuocUong (
    MaDonHang INT,
    MaMon VARCHAR(10),
    KichThuoc CHAR(1),
    SoLuong INT NOT NULL DEFAULT 1 CHECK (SoLuong > 0) ,

    PRIMARY KEY (MaDonHang, MaMon, KichThuoc),
    CONSTRAINT FK_GomDHNuocUong_MaDonHang FOREIGN KEY (MaDonHang) 
        REFERENCES DonHang(MaDonHang)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT FK_GomDHNuocUong_KichThuocDoUong FOREIGN KEY (KichThuoc, MaMon) 
        REFERENCES KichThuocDoUong(KichThuoc, MaMon)
        ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE Topping (
    MaMon VARCHAR(10) PRIMARY KEY,
    Gia DECIMAL(10 , 2 ) NOT NULL CHECK (Gia > 0),
    CONSTRAINT FK_Topping_MaMon FOREIGN KEY (MaMon)
        REFERENCES Menu (MaMon)
        ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE GomDH_Topping (
    MaDonHang INT,
    MaMon VARCHAR(10),
    SoLuong INT NOT NULL DEFAULT 0 CHECK (SoLuong >= 0) ,

    PRIMARY KEY (MaDonHang, MaMon),
    
    constraint FK_GomDHTopping_MaDonHang FOREIGN KEY (MaDonHang) REFERENCES DonHang(MaDonHang)
    on update cascade
    on delete cascade,
    constraint FK_GomDHTopping_MaMon FOREIGN KEY (MaMon) REFERENCES Topping(MaMon)
    on update cascade
    on delete cascade
);

CREATE TABLE GomDNH_NL (
    MaDon INT,
    MaNguyenLieu VARCHAR(10),
    SoLuong INT NOT NULL CHECK (SoLuong > 0),
    GiaNhap DECIMAL(10 , 2 ) NOT NULL CHECK (GiaNhap > 0),
    PRIMARY KEY (MaDon , MaNguyenLieu),
    CONSTRAINT FK_GomDNHNL_MaDon FOREIGN KEY (MaDon)
        REFERENCES DonNhapHang (MaDon)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT FK_GomDNHNL_MaNguyenLieu FOREIGN KEY (MaNguyenLieu)
        REFERENCES NguyenLieu (MaNguyenLieu)
        ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE Dung (
    MaNCC VARCHAR(6),
    MaMon VARCHAR(10),
    MaNguyenLieu VARCHAR(10),
    PRIMARY KEY (MaMon , MaNguyenLieu),
    CONSTRAINT FK_Dung_MaNCC FOREIGN KEY (MaNCC)
        REFERENCES NhaCungCap (MaNCC)
        ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT FK_Dung_MaMon FOREIGN KEY (MaMon)
        REFERENCES Menu (MaMon)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT FK_Dung_MaNguyenLieu FOREIGN KEY (MaNguyenLieu)
        REFERENCES NguyenLieu (MaNguyenLieu)
        ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE KhuyenMai (
    MaKhuyenMai VARCHAR(10) PRIMARY KEY,
    PhanTramChietKhau INT CHECK (PhanTramChietKhau BETWEEN 0 AND 100),
    DonToiThieu DECIMAL(10 , 2 ) CHECK (DonToiThieu >= 0),
    GiamToiDa DECIMAL(10 , 2 ) DEFAULT 0 CHECK (GiamToiDa >= 0),
    NgayBatDau DATE NOT NULL,
    NgayKetThuc DATE NOT NULL,
    SoLanSuDungToiDa INT DEFAULT 1 CHECK (SoLanSuDungToiDa > 0),
    CHECK (NgayBatDau < NgayKetThuc)
);

CREATE TABLE ApDung (
    MaKhuyenMai VARCHAR(10) PRIMARY KEY,
    MaDonHang INT,
    CONSTRAINT FK_ApDung_MaKhuyenMai FOREIGN KEY (MaKhuyenMai)
        REFERENCES KhuyenMai (MaKhuyenMai)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT FK_ApDung_MaDonHang FOREIGN KEY (MaDonHang)
        REFERENCES DonHang (MaDonHang)
        ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE UserAccount (
    MaNV VARCHAR(6) PRIMARY KEY,  -- Mã nhân viên
    Username VARCHAR(50) NOT NULL UNIQUE,  -- Tên đăng nhập
    Password VARCHAR(255) NOT NULL,  -- Mật khẩu (nên được mã hóa)
    Role ENUM('Manager', 'Employee') NOT NULL,  -- Vai trò người dùng (Quản lý hoặc Nhân viên)
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Thời gian tạo tài khoản
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP  -- Thời gian cập nhật tài khoản
);
-- TRIGGERS
-- Thêm cột tổng tiền cho đơn hàng
ALTER TABLE DonHang ADD COLUMN TongTien DECIMAL(10,2) DEFAULT 0;
DELIMITER $$

CREATE TRIGGER trg_CapNhatTongTien_DonHang
AFTER INSERT ON GomDH_NuocUong
FOR EACH ROW
BEGIN
    DECLARE tong DECIMAL(10,2);
    
    -- Tính tổng tiền nước uống của đơn hàng này
    SELECT SUM(Gia * SoLuong) INTO tong
    FROM GomDH_NuocUong gd
    JOIN KichThuocDoUong kt ON gd.MaMon = kt.MaMon AND gd.KichThuoc = kt.KichThuoc
    WHERE gd.MaDonHang = NEW.MaDonHang;

    -- Cộng thêm tiền topping
    SELECT tong + IFNULL(SUM(t.Gia * gt.SoLuong), 0) INTO tong
    FROM GomDH_Topping gt
    JOIN Topping t ON gt.MaMon = t.MaMon
    WHERE gt.MaDonHang = NEW.MaDonHang;

    -- Đảm bảo tổng tiền không bao giờ âm
    IF tong < 0 THEN
        SET tong = 0;
    END IF;

    -- Cập nhật lại tổng tiền đơn hàng
    UPDATE DonHang
    SET TongTien = tong
    WHERE MaDonHang = NEW.MaDonHang;
END$$

DELIMITER ;

DELIMITER $$

DELIMITER $$

CREATE TRIGGER prevent_topping_without_drinks
BEFORE INSERT ON GomDH_Topping
FOR EACH ROW
BEGIN
    DECLARE count_drinks INT;

    SELECT COUNT(*) INTO count_drinks
    FROM GomDH_NuocUong
    WHERE MaDonHang = NEW.MaDonHang;

    IF count_drinks = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Không thể thêm topping vào đơn hàng chưa có nước uống.';
    END IF;
END$$

DELIMITER ;



DELIMITER $$

CREATE TRIGGER trg_ValidateItemsInOrder_Drink
AFTER INSERT ON GomDH_NuocUong
FOR EACH ROW
BEGIN
    DECLARE countNuocUong INT;
    DECLARE countTopping INT;
    
    -- Kiểm tra số lượng nước uống trong đơn hàng
    SELECT COUNT(*) INTO countNuocUong
    FROM GomDH_NuocUong
    WHERE MaDonHang = NEW.MaDonHang;
    
    -- Kiểm tra số lượng topping trong đơn hàng
    SELECT COUNT(*) INTO countTopping
    FROM GomDH_Topping
    WHERE MaDonHang = NEW.MaDonHang;
    
    -- Nếu không có món nước uống hoặc topping, gửi lỗi
    IF countNuocUong = 0 AND countTopping = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Thiếu món (nước uống hoặc topping)';
    END IF;
END$$

DELIMITER ;
DELIMITER $$

CREATE TRIGGER trg_ValidateItemsInOrder_Topping
AFTER INSERT ON GomDH_Topping
FOR EACH ROW
BEGIN
    DECLARE countNuocUong INT;
    DECLARE countTopping INT;
    
    -- Kiểm tra số lượng nước uống trong đơn hàng
    SELECT COUNT(*) INTO countNuocUong
    FROM GomDH_NuocUong
    WHERE MaDonHang = NEW.MaDonHang;
    
    -- Kiểm tra số lượng topping trong đơn hàng
    SELECT COUNT(*) INTO countTopping
    FROM GomDH_Topping
    WHERE MaDonHang = NEW.MaDonHang;
    
    -- Nếu không có món nước uống hoặc topping, gửi lỗi
    IF countNuocUong = 0 AND countTopping = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Thiếu món (nước uống hoặc topping)';
    END IF;
END$$

DELIMITER ;

DELIMITER ;

-- Functions
-- Ham tinh tong doanh thu theo ngay -- 
DELIMITER //
CREATE FUNCTION TongDoanhThuTheoNgay(ngay DATE)
RETURNS DECIMAL(15, 2)
DETERMINISTIC
BEGIN
    DECLARE totalNuocUong DECIMAL(15,2);
    DECLARE totalTopping DECIMAL(15,2);

    -- Tinh tien Nuoc
    SELECT SUM(nd.SoLuong * ktd.Gia) INTO totalNuocUong
    FROM DonHang dh
    JOIN GomDH_NuocUong nd ON dh.MaDonHang = nd.MaDonHang
    JOIN KichThuocDoUong ktd ON nd.MaMon = ktd.MaMon AND nd.KichThuoc = ktd.KichThuoc
    WHERE DATE(dh.NgayGioTao) = ngay AND dh.TrangThai = 'Completed';

    -- Tinh tien Topping
    SELECT SUM(tpk.SoLuong * tp.Gia) INTO totalTopping
    FROM DonHang dh
    JOIN GomDH_Topping tpk ON dh.MaDonHang = tpk.MaDonHang
    JOIN Topping tp ON tpk.MaMon = tp.MaMon
    WHERE DATE(dh.NgayGioTao) = ngay AND dh.TrangThai = 'Completed';

    RETURN IFNULL(totalNuocUong, 0) + IFNULL(totalTopping, 0);
END //
DELIMITER ;

-- Ham tinh tong tien don hang --
DELIMITER //
CREATE   FUNCTION TongHoaDon(MDH INT) 
RETURNS DECIMAL(15,2)
DETERMINISTIC
BEGIN 
    DECLARE tong_tien DECIMAL(15,2) DEFAULT 0;
    DECLARE giam_gia DECIMAL(15,2) DEFAULT 0;
    DECLARE phan_tram INT;
    DECLARE don_toi_thieu DECIMAL(10,2);
    DECLARE giam_toi_da DECIMAL(10,2);
    
    -- Tong tien Nuoc --
    SELECT SUM(nd.SoLuong * kt.Gia) INTO tong_tien
    FROM GomDH_NuocUong nd
    JOIN KichThuocDoUong kt ON nd.MaMon = kt.MaMon AND nd.KichThuoc = kt.KichThuoc
    WHERE nd.MaDonHang = MDH;
    
    -- Tong tien Topping -- 
    SELECT tong_tien + IFNULL(SUM(tpk.SoLuong * tp.Gia),0) INTO tong_tien
    FROM GomDH_Topping tpk
    JOIN Topping tp ON tpk.MaMon = tp.MaMon
    WHERE tpk.MaDonHang = MDH;
    
	-- Ap dung Khuyen mai --
    SELECT PhanTramChietKhau, DonToiThieu, GiamToiDa INTO phan_tram, don_toi_thieu, giam_toi_da 
    FROM KhuyenMai km
    JOIN ApDung ad on km.MaKhuyenMai = ad.MaKhuyenMai
    WHERE ad.MaDonHang = MDH
    Limit 1; 
    
    -- Kiem tra dieu kien ap dung khuyen mai -- 
    IF tong_tien >= don_toi_thieu THEN 
		SET giam_gia = tong_tien * (phan_tram / 100);
        IF giam_gia > giam_toi_da THEN 
			SET giam_gia = giam_toi_da;
		END IF;
        SET tong_tien = tong_tien - giam_gia;
	END IF;
    
    RETURN IFNULL(tong_tien, 0);
END//
DELIMITER ;


-- Stored Procedure   
DELIMITER //
CREATE PROCEDURE ThongKeSoLuongMonTheoNgay(IN ngay DATE) 
BEGIN
    SELECT m.TenMon, SUM(nd.SoLuong) AS TongSoLuong
    FROM GomDH_NuocUong nd
    JOIN DonHang dh ON nd.MaDonHang = dh.MaDonHang
    JOIN Menu m ON nd.MaMon = m.MaMon
    WHERE DATE(dh.NgayGioTao) = ngay AND dh.TrangThai = 'Completed'
    GROUP BY nd.MaMon
    HAVING SUM(nd.SoLuong) > 0
    ORDER BY TongSoLuong ASC;
END//
DELIMITER ;

-- Insert data into NhanVien (Employee)
INSERT INTO NhanVien (MaNV, Ho, Ten) VALUES
('NV0001', 'Nguyen', 'Van A'),
('NV0002', 'Tran', 'Thi B'),
('NV0003', 'Le', 'Van C'),
('NV0004', 'Pham', 'Thi D'),
('NV0005', 'Hoang', 'Van E'),
('NV0006', 'Vo', 'Thi F'),
('NV0007', 'Dang', 'Van G'),
('NV0008', 'Bui', 'Thi H'),
('NV0009', 'Ngo', 'Van I'),
('NV0010', 'Do', 'Thi K');

-- Insert data into DiaChiNV (Employee Address)
INSERT INTO DiaChiNV (SoNha, Duong, Quan, ThanhPho, MaNV) VALUES
('123', 'Nguyen Hue', 'Quan 1', 'Ho Chi Minh', 'NV0001'),
('456', 'Le Loi', 'Quan 2', 'Ho Chi Minh', 'NV0002'),
('789', 'Tran Hung Dao', 'Quan 3', 'Ho Chi Minh', 'NV0003'),
('101', 'Vo Van Tan', 'Quan 4', 'Ho Chi Minh', 'NV0004'),
('202', 'Nguyen Trai', 'Quan 5', 'Ho Chi Minh', 'NV0005'),
('303', 'Ly Tu Trong', 'Quan 1', 'Ho Chi Minh', 'NV0006'),
('404', 'Hai Ba Trung', 'Quan 2', 'Ho Chi Minh', 'NV0007'),
('505', 'Pasteur', 'Quan 3', 'Ho Chi Minh', 'NV0008'),
('606', 'Nam Ky Khoi Nghia', 'Quan 4', 'Ho Chi Minh', 'NV0009'),
('707', 'Nguyen Thi Minh Khai', 'Quan 5', 'Ho Chi Minh', 'NV0010');

-- Insert data into SDT_NhanVien (Employee Phone)
INSERT INTO SDT_NhanVien (MaNV, SDT) VALUES
('NV0001', '0901234567'),
('NV0002', '0912345678'),
('NV0003', '0923456789'),
('NV0004', '0934567890'),
('NV0005', '0945678901'),
('NV0006', '0956789012'),
('NV0007', '0967890123'),
('NV0008', '0978901234'),
('NV0009', '0989012345'),
('NV0010', '0990123456');

-- Insert data into Email_NhanVien (Employee Email)
INSERT INTO Email_NhanVien (MaNV, Email) VALUES
('NV0001', 'vana@gmail.com'),
('NV0002', 'thib@gmail.com'),
('NV0003', 'vanc@gmail.com'),
('NV0004', 'thid@gmail.com'),
('NV0005', 'vane@gmail.com'),
('NV0006', 'thif@gmail.com'),
('NV0007', 'vang@gmail.com'),
('NV0008', 'thih@gmail.com'),
('NV0009', 'vani@gmail.com'),
('NV0010', 'thik@gmail.com');

-- Insert data into CaLam (Work Shift)
INSERT INTO CaLam (MaCa, NgayLam, GioLam, GioTan) VALUES
('CA001', '2024-04-01', '07:00:00', '11:00:00'),
('CA002', '2024-04-01', '11:00:00', '15:00:00'),
('CA003', '2024-04-01', '15:00:00', '19:00:00'),
('CA004', '2024-04-01', '19:00:00', '23:00:00'),
('CA005', '2024-04-02', '07:00:00', '11:00:00'),
('CA006', '2024-04-02', '11:00:00', '15:00:00'),
('CA007', '2024-04-02', '15:00:00', '19:00:00'),
('CA008', '2024-04-02', '19:00:00', '23:00:00'),
('CA009', '2024-04-03', '07:00:00', '11:00:00'),
('CA010', '2024-04-03', '11:00:00', '15:00:00');

-- Insert data into NV_Lam (Employee Shifts)
INSERT INTO NV_Lam (MaNV, MaCa) VALUES
('NV0001', 'CA001'),
('NV0002', 'CA002'),
('NV0003', 'CA003'),
('NV0004', 'CA004'),
('NV0005', 'CA005'),
('NV0006', 'CA006'),
('NV0007', 'CA007'),
('NV0008', 'CA008'),
('NV0009', 'CA009'),
('NV0010', 'CA010');

-- Insert data into KhachHang (Customer)
INSERT INTO KhachHang (Ho, Ten, DiemTichLuy) VALUES
('Le', 'Van Minh', 0),
('Tran', 'Thi Huong', 250),
('Nguyen', 'Van Binh', 500),
('Pham', 'Thi Lan', 750),
('Hoang', 'Van Nam', 1000),
('Vo', 'Thi Nga', 2000),
('Dang', 'Van Toan', 3000),
('Bui', 'Thi Mai', 4000),
('Ngo', 'Van Hieu', 5000),
('Do', 'Thi Hong', 6000);

-- Insert data into SDT_KhachHang (Customer Phone)
INSERT INTO SDT_KhachHang (MaKH, SDT) VALUES
(1, '0901111111'),
(2, '0902222222'),
(3, '0903333333'),
(4, '0904444444'),
(5, '0905555555'),
(6, '0906666666'),
(7, '0907777777'),
(8, '0908888888'),
(9, '0909999999'),
(10, '0900000000');

-- Insert data into NhaCungCap (Supplier)
INSERT INTO NhaCungCap (MaNCC, TenNCC, MaSoThue) VALUES
('NC0001', 'Cong ty TNHH Nguyen Lieu A', '0123456789012'),
('NC0002', 'Cong ty TNHH Nguyen Lieu B', '1234567890123'),
('NC0003', 'Cong ty TNHH Nguyen Lieu C', '2345678901234'),
('NC0004', 'Cong ty TNHH Nguyen Lieu D', '3456789012345'),
('NC0005', 'Cong ty TNHH Nguyen Lieu E', '4567890123456'),
('NC0006', 'Cong ty TNHH Nguyen Lieu F', '5678901234567'),
('NC0007', 'Cong ty TNHH Nguyen Lieu G', '6789012345678'),
('NC0008', 'Cong ty TNHH Nguyen Lieu H', '7890123456789'),
('NC0009', 'Cong ty TNHH Nguyen Lieu I', '8901234567890'),
('NC0010', 'Cong ty TNHH Nguyen Lieu K', '9012345678901');

-- Insert data into DiaChiNCC (Supplier Address)
INSERT INTO DiaChiNCC (SoNha, Duong, Quan, ThanhPho, MaNCC) VALUES
('10', 'Le Duan', 'Quan 1', 'Ho Chi Minh', 'NC0001'),
('20', 'Tran Phu', 'Quan 2', 'Ho Chi Minh', 'NC0002'),
('30', 'Nguyen Cong Tru', 'Quan 3', 'Ho Chi Minh', 'NC0003'),
('40', 'Vo Thi Sau', 'Quan 4', 'Ho Chi Minh', 'NC0004'),
('50', 'Dinh Tien Hoang', 'Quan 5', 'Ho Chi Minh', 'NC0005'),
('60', 'Le Van Sy', 'Quan 1', 'Ho Chi Minh', 'NC0006'),
('70', 'Tran Quoc Thao', 'Quan 2', 'Ho Chi Minh', 'NC0007'),
('80', 'Nguyen Dinh Chieu', 'Quan 3', 'Ho Chi Minh', 'NC0008'),
('90', 'Vo Van Tan', 'Quan 4', 'Ho Chi Minh', 'NC0009'),
('100', 'Dien Bien Phu', 'Quan 5', 'Ho Chi Minh', 'NC0010');

-- Insert data into SDT_NCC (Supplier Phone)
INSERT INTO SDT_NCC (MaNCC, SDT) VALUES
('NC0001', '0911111111'),
('NC0002', '0922222222'),
('NC0003', '0933333333'),
('NC0004', '0944444444'),
('NC0005', '0955555555'),
('NC0006', '0966666666'),
('NC0007', '0977777777'),
('NC0008', '0988888888'),
('NC0009', '0999999999'),
('NC0010', '0900000001');

-- Insert data into Email_NCC (Supplier Email)
INSERT INTO Email_NCC (MaNCC, Email) VALUES
('NC0001', 'nlieua@gmail.com'),
('NC0002', 'nlieub@gmail.com'),
('NC0003', 'nlieuc@gmail.com'),
('NC0004', 'nlieud@gmail.com'),
('NC0005', 'nlieue@gmail.com'),
('NC0006', 'nlieuf@gmail.com'),
('NC0007', 'nlieug@gmail.com'),
('NC0008', 'nlieuh@gmail.com'),
('NC0009', 'nlieui@gmail.com'),
('NC0010', 'nlieuk@gmail.com');

-- Insert data into NguyenLieu (Ingredients)
INSERT INTO NguyenLieu (MaNguyenLieu, TenNguyenLieu, MoTa, DonGia, TonKho, DonViTinh) VALUES
('NL001', 'Ca phe', 'Ca phe nguyen chat', 100000.00, 50, 'kg'),
('NL002', 'Sua tuoi', 'Sua tuoi nguyen chat', 30000.00, 100, 'ml'),
('NL003', 'Sua dac', 'Sua dac nguyen chat', 25000.00, 80, 'ml'),
('NL004', 'Duong', 'Duong nguyen chat', 20000.00, 120, 'kg'),
('NL005', 'Tra xanh', 'Tra xanh nguyen chat', 80000.00, 60, 'kg'),
('NL006', 'Tra den', 'Tra den nguyen chat', 75000.00, 70, 'kg'),
('NL007', 'Dau tay', 'Dau tay tuoi', 60000.00, 40, 'kg'),
('NL008', 'Cam', 'Cam tuoi', 50000.00, 45, 'kg'),
('NL009', 'Chanh', 'Chanh tuoi', 40000.00, 55, 'kg'),
('NL010', 'Bot nang', 'Bot nang da dung MeiZan', 90000.00, 30, 'kg');

-- Insert data into Menu (Menu Items)
INSERT INTO Menu (MaMon, TenMon) VALUES
('M001', 'Ca phe den'),
('M002', 'Ca phe sua'),
('M003', 'Tra sua tran chau'),
('M004', 'Tra xanh'),
('M005', 'Tra dao'),
('M006', 'Nuoc cam'),
('M007', 'Sinh to dau'),
('M008', 'Sua chua da'),
('M009', 'Tran chau duong den'),
('M010', 'Thach dua');

-- Insert data into NuocUong (Drinks)
INSERT INTO NuocUong (MaMon) VALUES
('M001'),
('M002'),
('M003'),
('M004'),
('M005'),
('M006'),
('M007'),
('M008');

-- Insert data into KichThuocDoUong (Drink Sizes)
INSERT INTO KichThuocDoUong (KichThuoc, Gia, MaMon) VALUES
('S', 25000.00, 'M001'),
('M', 30000.00, 'M001'),
('L', 35000.00, 'M001'),
('S', 30000.00, 'M002'),
('M', 35000.00, 'M002'),
('L', 40000.00, 'M002'),
('S', 35000.00, 'M003'),
('M', 40000.00, 'M003'),
('L', 45000.00, 'M003'),
('S', 25000.00, 'M004');

-- Insert data into Topping (Toppings)
INSERT INTO Topping (MaMon, Gia) VALUES
('M009', 5000.00),
('M010', 5000.00);

-- Insert data into DonHang (Orders)
INSERT INTO DonHang (TrangThai, MaNV, MaKH, NgayGioTao) VALUES
('Completed', 'NV0001', 1, '2024-04-01 08:30:00'),
('Completed', 'NV0002', 2, '2024-04-01 10:15:00'),
('Completed', 'NV0003', 3, '2024-04-01 12:45:00'),
('Completed', 'NV0004', 4, '2024-04-01 14:20:00'),
('Completed', 'NV0005', 5, '2024-04-02 09:10:00'),
('Completed', 'NV0006', 6, '2024-04-02 11:30:00'),
('Preparing', 'NV0007', 7, '2024-04-02 13:45:00'),
('Pending', 'NV0008', 8, '2024-04-02 15:20:00'),
('Pending', 'NV0009', 9, '2024-04-03 08:50:00'),
('Pending', 'NV0010', 10, '2024-04-03 10:40:00');

-- Insert data into GomDH_NuocUong (Order Drink Details)
INSERT INTO GomDH_NuocUong (MaDonHang, MaMon, KichThuoc, SoLuong) VALUES 
(1, 'M001', 'S', 2), 
(2, 'M002', 'M', 1),
(3, 'M003', 'L', 3),
(4, 'M004', 'S', 2),
(5, 'M001', 'M', 1),
(6, 'M002', 'L', 2),
(7, 'M003', 'S', 1),
(8, 'M004', 'S', 2),
(9, 'M001', 'L', 1),
(10, 'M002', 'M', 2);

-- Insert data into GomDH_Topping (Order Topping Details)
INSERT INTO GomDH_Topping (MaDonHang, MaMon, SoLuong) VALUES
(1, 'M009', 1),
(2, 'M010', 2),
(3, 'M009', 3),
(4, 'M010', 1),
(5, 'M009', 2),
(6, 'M010', 1),
(7, 'M009', 1),
(8, 'M010', 2),
(9, 'M009', 1),
(10, 'M010', 1);

-- Insert data into DonNhapHang (Ingredient Import Orders)
INSERT INTO DonNhapHang (NgayNhap, MaNV, MaNCC) VALUES
('2024-03-01', 'NV0001', 'NC0001'),
('2024-03-05', 'NV0002', 'NC0002'),
('2024-03-10', 'NV0003', 'NC0003'),
('2024-03-15', 'NV0004', 'NC0004'),
('2024-03-20', 'NV0005', 'NC0005'),
('2024-03-25', 'NV0006', 'NC0006'),
('2024-03-30', 'NV0007', 'NC0007'),
('2024-04-01', 'NV0008', 'NC0008'),
('2024-04-05', 'NV0009', 'NC0009'),
('2024-04-10', 'NV0010', 'NC0010');

-- Insert data into GomDNH_NL (Ingredient Import Details)
INSERT INTO GomDNH_NL (MaDon, MaNguyenLieu, SoLuong, GiaNhap) VALUES
(1, 'NL001', 10, 90000.00),
(2, 'NL002', 20, 28000.00),
(3, 'NL003', 15, 23000.00),
(4, 'NL004', 25, 18000.00),
(5, 'NL005', 12, 75000.00),
(6, 'NL006', 15, 70000.00),
(7, 'NL007', 8, 55000.00),
(8, 'NL008', 10, 45000.00),
(9, 'NL009', 12, 38000.00),
(10, 'NL010', 5, 85000.00);

-- Insert data into Dung (Ingredients Used in Menu Items)
INSERT INTO Dung (MaNCC, MaMon, MaNguyenLieu) VALUES
('NC0001', 'M001', 'NL001'),
('NC0002', 'M002', 'NL002'),
('NC0003', 'M003', 'NL003'),
('NC0004', 'M004', 'NL005'),
('NC0005', 'M005', 'NL006'),
('NC0006', 'M006', 'NL008'),
('NC0007', 'M007', 'NL007'),
('NC0008', 'M008', 'NL002'),
('NC0009', 'M009', 'NL010'),
('NC0010', 'M010', 'NL004');

-- Insert data into KhuyenMai (Promotions)
INSERT INTO KhuyenMai (MaKhuyenMai, PhanTramChietKhau, DonToiThieu, GiamToiDa, NgayBatDau, NgayKetThuc, SoLanSuDungToiDa) VALUES
('KM001', 10, 50000.00, 20000.00, '2024-04-01', '2024-04-15', 100),
('KM002', 15, 100000.00, 30000.00, '2024-04-01', '2024-04-30', 50),
('KM003', 20, 150000.00, 40000.00, '2024-04-15', '2024-05-15', 30),
('KM004', 25, 200000.00, 50000.00, '2024-05-01', '2024-05-31', 20),
('KM005', 30, 250000.00, 60000.00, '2024-06-01', '2024-06-30', 10),
('KM006', 10, 50000.00, 15000.00, '2024-07-01', '2024-07-15', 100),
('KM007', 15, 100000.00, 25000.00, '2024-07-16', '2024-07-31', 50),
('KM008', 20, 150000.00, 35000.00, '2024-08-01', '2024-08-15', 30),
('KM009', 25, 200000.00, 45000.00, '2024-08-16', '2024-08-31', 20),
('KM010', 30, 250000.00, 55000.00, '2024-09-01', '2024-09-30', 10);

-- Insert data into ApDung (Applied Promotions)
INSERT INTO ApDung (MaKhuyenMai, MaDonHang) VALUES
('KM001', 1),
('KM002', 2),
('KM003', 3),
('KM004', 4),
('KM005', 5),
('KM006', 6),
('KM007', 7),
('KM008', 8),
('KM009', 9),
('KM010', 10);

INSERT INTO UserAccount (MaNV, Username, Password, Role) VALUES 
('NV0001', 'admin', '1', 'Manager'),
('NV0002', 'staff', '2', 'Employee');

-- SELECT * FROM GomDH_NuocUong;
-- SHOW DATABASES;
-- SHOW TABLES;
SHOW ERRORS;

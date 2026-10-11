# CHECKLIST ĐÁNH GIÁ HIỆN TRẠNG - M2W (SAIGON WATERBUS)

**Ngày cập nhật:** 16/10/2025
**Nguồn dữ liệu:** Hợp đồng 226/SM-M2W, Khảo sát FINAL, PC Inventory

---

## 📋 1. QUY MÔ HOẠT ĐỘNG

### Nhân sự

| Hạng mục | Thông tin cần thu thập | Hiện trạng | Ghi chú |
|----------|------------------------|------------|---------|
| **Tổng số nhân viên** | ___ người | ⚠️ **Chưa xác định chính xác** | Ước tính 50-100 người (cần xác minh từ HCNS) |
| **Nhân viên văn phòng** | ___ người | ✅ **~35-40 người** | Dựa trên 38 PC văn phòng + 8 laptop |
| **Nhân viên vận hành (thuyền viên)** | ___ người | ❓ **Chưa có** | Cần thu thập từ phòng vận hành |
| **Nhân viên IT** | ___ người | ⚠️ **0 người (hiện tại không có IT nội bộ)** | M-TECHCARE cung cấp đội ngũ IT |

### Địa điểm

| Hạng mục | Thông tin cần thu thập | Hiện trạng | Ghi chú |
|----------|------------------------|------------|---------|
| **Văn phòng chính** | Địa chỉ? | ✅ **The Opera, Thủ Thiêm, TP.HCM** | Văn phòng điều hành chính |
| **Chi nhánh/Bến tàu** | Số lượng? | ✅ **7 bến tàu** | Xem chi tiết bên dưới |
| **Kho/Xưởng** | Có/Không? | ❓ **Chưa xác nhận** | Cần khảo sát thêm |

#### Chi tiết 7 bến tàu:
1. **Bến Bạch Đằng** - 10B Đường Tôn Đức Thắng, Phường Bến Nghé, Quận 1, TP.HCM (2 PC)
2. **Bến Thủ Thiêm** - Bến tàu Thủ Thiêm, Nguyễn Thiện Thành, An Khánh, Thủ Đức, TP.HCM (1 PC)
3. **Bến Bình An** - Đường Số 21, Phường Bình An, Quận 2, TP.HCM (1 PC)
4. **Bến Thanh Đa** - Lô 1, Thanh Da, Phường 27, Quận Bình Thạnh, TP.HCM (1 PC)
5. **Bến Linh Đông** - Cuối đường 36, Linh Đông, Thủ Đức, TP.HCM (2 PC)
6. **Bến Hiệp Bình Chánh** - 70 đường số 10, Hiệp Bình Chánh, Thủ Đức, TP.HCM (1 PC)
7. **Bến Thảo Điền** - Nguyễn Văn Hưởng, Phường Thảo Điền, TP. Thủ Đức (1 PC)

### Phương tiện

| Hạng mục | Thông tin cần thu thập | Hiện trạng | Ghi chú |
|----------|------------------------|------------|---------|
| **Số lượng tàu/phà** | ___ chiếc | ❓ **Chưa có** | Fleet Management System cần thu thập |
| **Loại tàu** | | ❓ **Chưa có** | Cần thông tin từ phòng kỹ thuật |
| **Tần suất vận hành** | ___ chuyến/ngày | ❓ **Chưa có** | Lịch trình tàu cần được cung cấp |

---

## 📂 2. DỮ LIỆU HIỆN TẠI

### Documents (Tài liệu)

| Loại dữ liệu | Chi tiết | Dung lượng | Tần suất truy cập | Ghi chú |
|--------------|----------|------------|-------------------|---------|
| **Hồ sơ pháp lý** | Giấy phép, license tàu | ❓ **___ GB** | Thấp | Cần khảo sát File Server |
| **Báo cáo vận hành** | Daily/Monthly reports | ❓ **___ GB** | Cao | Đang được tạo hàng ngày |
| **Hồ sơ nhân sự** | HR documents | ❓ **___ GB** | Trung bình | Phòng HCNS quản lý |

### Fleet Data (Dữ liệu tàu thuyền)

| Loại dữ liệu | Chi tiết | Dung lượng | Tần suất truy cập | Ghi chú |
|--------------|----------|------------|-------------------|---------|
| **Lịch trình tàu** | Schedule, route | ❓ **___ GB** | Rất cao | Real-time scheduling |
| **Bảo trì/Sửa chữa** | Maintenance logs | ❓ **___ GB** | Cao | Logs định kỳ |
| **GPS/Tracking** | Real-time data | ❓ **___ GB** | Real-time | Yêu cầu API integration |

### Media (Phương tiện truyền thông)

| Loại dữ liệu | Chi tiết | Dung lượng | Tần suất truy cập | Ghi chú |
|--------------|----------|------------|-------------------|---------|
| **Camera giám sát** | CCTV footage | ❓ **___ TB** | Cao | 100 cameras theo hợp đồng |
| **Hình ảnh/Video** | Marketing materials | ❓ **___ GB** | Thấp | Photo/video assets |

### 📊 Tóm tắt

| **TỔNG DUNG LƯỢNG** | ❓ **___ TB** | **Cần khảo sát File Server hiện tại** |

---

## 🚢 3. FLEET MANAGEMENT SYSTEM

| Component | Hiện trạng | Yêu cầu tích hợp | Ghi chú |
|-----------|------------|------------------|---------|
| **GPS Tracking** | ❓ **Chưa xác nhận** | API integration? | Cần xác nhận hệ thống hiện tại |
| **Ticketing System** | ✅ **Có (Omni call CRM)** | Database sync? | Tổng đài Omni call CRM (theo PLHD) |
| **Maintenance Schedule** | ❓ **Chưa xác nhận** | Calendar integration? | Cần khảo sát quy trình bảo trì |
| **Fuel Management** | ❓ **Chưa có** | Report automation? | Chưa triển khai |
| **Crew Management** | ⚠️ **Thủ công** | HR system link? | Cần tích hợp với HCNS |
| **Customer App** | ❓ **Chưa xác nhận** | Real-time data? | Kiểm tra app di động |

---

## 🌐 4. HẠ TẦNG MẠNG & INTERNET

### Văn phòng chính (The Opera)

| Địa điểm | Băng thông | ISP | Backup | SLA | Ghi chú |
|----------|------------|-----|--------|-----|---------|
| **Internet chính** | ❓ **___ Mbps** | ❓ | ❓ | ❓ | Cần khảo sát |
| **Backup line** | ❓ **___ Mbps** | ❓ | - | ❓ | Khuyến nghị có backup |
| **LAN speed** | ⚠️ **1 Gbps** | - | - | - | Giả định chuẩn Gigabit |

### Tại các bến tàu

| Địa điểm | Băng thông | ISP | Backup | SLA | Ghi chú |
|----------|------------|-----|--------|-----|---------|
| **Bến Bạch Đằng** | ❓ **___ Mbps** | ❓ | ❓ | ❓ | Có WiFi (trong hệ sinh thái kinh doanh) |
| **Bến Thủ Thiêm** | ❓ **___ Mbps** | ❓ | ❓ | ❓ | Có WiFi (trong hệ sinh thái kinh doanh) |
| **Các bến khác** | ❓ **___ Mbps** | ❓ | ❓ | ❓ | Cần khảo sát từng bến |

### Trên tàu

| Loại kết nối | Băng thông | ISP | Backup | SLA | Ghi chú |
|--------------|------------|-----|--------|-----|---------|
| **4G/5G Router** | ❓ **___ Mbps** | ❓ | ❓ | ❓ | Cho vận hành thời gian thực |
| **Satellite (nếu có)** | ❓ | ❓ | - | ❓ | Chưa xác nhận |
| **WiFi cho khách** | ❓ | ❓ | - | ❓ | Customer experience |

---

## 💻 5. THIẾT BỊ ENDPOINT

### Văn phòng

| Loại thiết bị | Số lượng | OS | Tuổi TB | Ghi chú |
|---------------|----------|----|---------|---------|
| **Desktop PC** | ✅ **30 chiếc** | ✅ **Win 10/11** | ⚠️ **5-8 năm** | Nhiều PC cũ (Core i3-4160, i5-4460) |
| **Laptop** | ✅ **8 chiếc** | ✅ **Win 10/11** | ⚠️ **3-5 năm** | Mix các dòng Dell, HP, Asus |
| **Printer/Scanner** | ✅ **7 máy in bill** | - | ❓ | Bill printers (theo PLHD) |
| **Photocopier** | ✅ **4 máy** | - | ❓ | Máy Photocopy/Fax/Scan (theo PLHD) |

#### Chi tiết theo bộ phận:
- **Kế toán:** 16 PC (lớn nhất)
- **HCNS:** 4 PC
- **BOD:** 2 PC
- **Vận hành:** 2 PC
- **Bán vé:** 2 PC
- **Dự án:** 1 PC
- **Lễ tân:** 1 PC
- **Phòng họp:** 1 PC
- **Trợ lý BGĐ:** 1 PC
- **Trưởng phòng dự án:** 1 PC
- **Trưởng phòng kỹ thuật:** 1 PC
- **Giám đốc:** 1 PC
- **Sáng tạo:** 1 PC
- **Admin:** 1 PC
- **Trợ lý quản lý vận hành:** 1 PC
- **Quản lý vận hành:** 1 PC
- **Giám sát chất lượng tàu:** 1 PC

### Trên tàu (Tại các bến)

| Loại thiết bị | Số lượng | OS | Tuổi TB | Ghi chú |
|---------------|----------|----|---------|---------|
| **Desktop PC (Bến tàu)** | ✅ **9 chiếc** | ✅ **Win 10/11** | ⚠️ **3-7 năm** | PC bán vé tại bến |
| **Tablet** | ❓ **___ chiếc** | ❓ iOS/Android? | ❓ | For crew - chưa xác nhận |
| **POS Terminal** | ⚠️ **Không xác định** | - | ❓ | Ticketing - có thể dùng PC |
| **GPS Device** | ❓ **___ chiếc** | - | ❓ | Navigation - cần khảo sát |
| **Camera System** | ✅ **100 cameras** | - | ❓ | Theo PLHD (CCTV hệ thống) |

#### PC tại từng bến:
- **Bến Linh Đông:** 2 PC (bán vé + bảo vệ)
- **Bến Bạch Đằng:** 2 PC (bán vé)
- **Bến Hiệp Bình Chánh:** 1 PC
- **Bến Thanh Đa:** 1 PC
- **Bến Thảo Điền:** 1 PC
- **Bến Bình An:** 1 PC
- **Bến Thủ Thiêm:** 1 PC

### 📊 Tổng hợp thiết bị

| **Tổng số PC/Laptop** | ✅ **47 chiếc** | 38 văn phòng + 9 bến tàu |
| **Tổng số Printer** | ✅ **7 máy** | Bill printers |
| **Tổng số Photocopier** | ✅ **4 máy** | Máy đa chức năng |
| **Tổng số Camera** | ✅ **100 cameras** | Hệ thống CCTV |
| **Tổng đài** | ✅ **1 hệ thống** | Omni call CRM |

---

## 🖥️ 6. HỆ THỐNG SERVER & STORAGE

### Server

| Component | Hiện trạng | Specs | Location | Ghi chú |
|-----------|------------|-------|----------|---------|
| **File Server** | ⚠️ **CHƯA CÓ** | ❓ | ❓ | **Cần triển khai theo PLHD mục 17** |
| **Database Server** | ❓ **Chưa xác nhận** | ❓ | ❓ | Có thể dùng cloud hoặc on-prem |
| **Application Server** | ❓ **Chưa xác nhận** | ❓ | ❓ | Cho Fleet Management |
| **Email Server** | ⚠️ **CHƯA CÓ** | - | - | **Chưa có hệ thống Microsoft 365** |

### Storage

| Component | Hiện trạng | Capacity | Location | Ghi chú |
|-----------|------------|----------|----------|---------|
| **NAS/SAN** | ❓ **Chưa có** | ❓ **___ TB** | On-prem? | Cần triển khai cho backup |
| **Cloud Storage** | ⚠️ **Không xác định** | ❓ | Google Drive? | Chưa có hệ thống tập trung |
| **Backup Storage** | ❓ **Chưa có** | ❓ **___ TB** | ❓ | **Cần triển khai 3-2-1 strategy** |

### ⚠️ Lưu ý quan trọng:
> **Theo PLHD mục 14, 15, 17:** Hiện tại M2W **CHƯA CÓ**:
> - ✗ Email Server
> - ✗ Microsoft 365
> - ✗ File Server tập trung
>
> **M-TECHCARE cần triển khai:**
> - ✓ Hệ thống File Server (mục 17)
> - ✓ Hệ thống Backup & Restore (mục 15)
> - ✓ Chuẩn hóa dữ liệu user

---

## 🔒 7. SECURITY & COMPLIANCE

### Bảo mật

| Hạng mục | Hiện trạng | Yêu cầu | Ghi chú |
|----------|------------|---------|---------|
| **Firewall** | ❓ **Chưa xác nhận** | ✓ Next-gen firewall | Cần khảo sát thiết bị hiện tại |
| **Antivirus** | ⚠️ **Chưa có hệ thống** | ✓ Enterprise AV | **Cần triển khai theo PLHD mục 8** |
| **Backup Solution** | ❓ **Chưa có** | ✓ 3-2-1 strategy | **Triển khai theo PLHD mục 15** |
| **VPN** | ❓ **Chưa xác nhận** | ✓ Site-to-site | Kết nối văn phòng - bến tàu |
| **Access Control** | ⚠️ **Chưa có AD** | ✓ AD/LDAP | User không được quản lý tập trung |

### Giám sát & Bảo mật hạ tầng (Theo PLHD mục 16)

| Tính năng | Hiện trạng | Ghi chú |
|-----------|------------|---------|
| **Giám sát hiệu suất** | ❓ **Chưa có** | Bảo mật hạ tầng cần triển khai |
| **Network Monitoring** | ❓ **Chưa có** | Theo dõi uptime, băng thông |
| **Security Monitoring** | ❓ **Chưa có** | Wi-Fi, Router, Access Point |

### Compliance (Tuân thủ)

| Hạng mục | Hiện trạng | Yêu cầu | Ghi chú |
|----------|------------|---------|---------|
| **Maritime regulations** | ❓ **Chưa xác nhận** | ✓ Chuẩn ngành hàng hải | Cần tư vấn pháp lý |
| **Data Protection** | ❓ **Chưa có policy** | ✓ GDPR/PDPA-like | Bảo vệ dữ liệu khách hàng |
| **Backup & DR Policy** | ❓ **Chưa có** | ✓ Disaster Recovery | Theo PLHD mục 15 |

---

## 📝 8. TỔNG HỢP VÀ KHUYẾN NGHỊ

### ✅ Đã có sẵn:
1. ✓ 47 PC/Laptop tại văn phòng và 7 bến tàu
2. ✓ 7 máy in bill, 4 máy photocopy
3. ✓ 100 cameras CCTV
4. ✓ Tổng đài Omni call CRM
5. ✓ Hệ thống mạng cơ bản tại các địa điểm

### ⚠️ Cần thu thập thêm:
1. **QUY MÔ:** Số lượng nhân viên chính xác (đặc biệt thuyền viên)
2. **FLEET:** Số lượng tàu, lịch trình, GPS tracking
3. **DỮ LIỆU:** Tổng dung lượng dữ liệu hiện tại
4. **MẠNG:** Băng thông internet, ISP, backup line
5. **STORAGE:** Dung lượng lưu trữ hiện tại và nhu cầu

### 🔧 Cần triển khai (Theo PLHD):
1. **Email Server & Microsoft 365** (Mục 14 PLHD - hiện chưa có)
2. **File Server tập trung** (Mục 17 PLHD - chuẩn hóa tên máy, user, thiết bị)
3. **Backup & Restore System** (Mục 15 PLHD - 3-2-1 strategy)
4. **Antivirus Enterprise** (Mục 8 PLHD)
5. **Network Monitoring** (Mục 7, 16 PLHD)
6. **Access Control (AD/LDAP)** - Quản lý user tập trung

### 📅 Lộ trình đề xuất:
**Giai đoạn 1 (Tháng 1-2):** Thu thập đầy đủ thông tin còn thiếu
**Giai đoạn 2 (Tháng 2-3):** Triển khai File Server, Email, Backup
**Giai đoạn 3 (Tháng 3-4):** Triển khai Antivirus, Network Monitoring
**Giai đoạn 4 (Tháng 4-6):** Tối ưu hóa, tích hợp Fleet Management

---

## 📞 LIÊN HỆ ĐỂ THU THẬP THÔNG TIN

### Bộ phận cần phối hợp:

1. **Phòng HCNS**
   - Tổng số nhân viên chính xác
   - Danh sách thuyền viên
   - Cơ cấu tổ chức

2. **Phòng Kỹ thuật**
   - Thông tin tàu thuyền (số lượng, loại, specs)
   - GPS tracking system
   - Maintenance schedule

3. **Phòng Vận hành**
   - Lịch trình tàu hàng ngày
   - Số lượng chuyến/ngày
   - Fleet operation data

4. **Phòng Kế toán/Admin**
   - Hợp đồng ISP hiện tại
   - Chi phí internet/telecom
   - Vendor hiện tại

5. **BOD**
   - Phê duyệt kế hoạch triển khai
   - Budget cho infrastructure
   - Strategic direction

---

**Người lập:** M-TECHCARE IT Team
**Ngày:** 16/10/2025
**Hợp đồng:** 226/SM-M2W
**Trạng thái:** 🟡 Đang thu thập thông tin (50% hoàn thành)

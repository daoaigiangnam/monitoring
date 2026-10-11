# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the M2W (SAIGON WATERBUS) client directory within the M-TECHCARE managed IT services portfolio. This directory contains all operational documentation, contracts, and IT infrastructure information for the Saigon Waterbus client, a water transportation service operating multiple ferry terminals across Saigon.

**Client:** M2W (Saigon Waterbus)
**Service Provider:** M-TECHCARE / MStar Corp
**Service Type:** Managed IT Services (M-TECHCARE)
**Contract Number:** 226/SM-M2W
**Contract Date:** 22/09/2025
**Service Period:** 01/10/2025 - 30/09/2026 (12 months)
**Contract Value:** 233.280.000 VNĐ (including VAT)
**Monthly Fee:** 19.440.000 VNĐ/month

## Directory Structure

### Root Level Files
- **WATERBUS_KNOWLEDGE_BASE.md** - Comprehensive knowledge base with all system information
- **TIMELINE_TIẾP NHẬN VÀ VẬN HÀNH.osheet** - Timeline for service intake and operations
- **TỔNG HỢP THÔNG TIN.osheet** - Consolidated information summary

### Main Directories

#### HOP DONG - PLHD - NDA/
Contains all legal and contractual documents:
- `[SM-M2W] Hop dong dich vụ IT.pdf` - IT service contract
- `[SM-M2W] Phu luc hop dong.pdf` - Contract appendix
- `[SM-M2W] Thoa thuan bao mat NDA.pdf` - NDA/confidentiality agreement

#### C. VAN HANH DICH VU M-TECHCARE/
Operations directory following ITIL4 service lifecycle:
1. **HIEN TRANG VA TIEP NHAN/** - Current status and intake
   - Intake handover documents
   - Equipment information spreadsheets
   - PC and network configuration data
   - Survey recaps and assessment documents
   - **FINAL/** subdirectory contains finalized documentation:
     - Domain and email migration lists
     - PC information for terminals and offices
     - Comprehensive survey documents

2. **QUY HOACH HE THONG/** - System planning

3. **VAN HANH/** - Operations (currently empty)

4. **GIAM SAT/** - Monitoring

5. **SAO LUU - PHUC HOI/** - Backup and recovery

6. **BAO CAO/** - Reporting

7. **SO TAY CNTT - IT POLICY/** - IT handbook and policies
   - `[MSTAR CORP] HDSD QUY TRINH VAN HANH WEBFORM.pdf` - Web form operations guide

8. **KHAO SAT CHAT LUONG DICH VU/** - Service quality surveys
   - Survey links and feedback forms

## Client Infrastructure

### Terminal Locations (Bến Tàu)
The client operates 6 ferry terminal locations with PCs at each:
1. **Bến Bình An** - Intel Core i5-12400, 16GB RAM, Win11 Pro
2. **Bến Thanh Đa** - Intel Core i5-8500, 8GB RAM, Win11 Pro
3. **Bến Thảo Điền** - Intel Core i5-12400, 16GB RAM, Win11 Pro
4. **Hiệp Bình Chánh** - Intel Core i5-12400, 16GB RAM, Win11 Pro
5. **Linh Đông** - Multiple PCs (ticket office and security)
6. **Thủ Thiêm** - Intel Core i5-12400, 16GB RAM, Win11 Pro

### Office Infrastructure (Văn Phòng)
- Multiple departmental PCs (BOD, Project, HR, Accounting, Technical, Reception, Meeting Room)
- Laptop: HP Pavilion x360 (Đào Kim Hằng)
- Network equipment: WiFi (RUJIE, UNIFI), analog PBX
- Camera systems at accounting areas

### Standard PC Configuration
- **CPU:** Intel Core i5-12400 (newer) or i5-8500 (older)
- **Mainboard:** GIGABYTE H610M H V3 DDR4 or ASRock H370M-HDV/M.2
- **RAM:** 8-16GB DDR4-3200
- **Storage:** HDD 250GB + SSD NVMe 250-512GB
- **OS:** Windows 11 Professional/Home
- **Graphics:** Intel UHD Graphics 730/630/Iris Xe
- **Network:** Gigabit Ethernet, some with WiFi 6E
- **Security:** TPM 2.0, Secure Boot enabled

## File Naming Conventions

### Vietnamese Language Support
- All filenames and content use Vietnamese with proper diacritics
- Encoding: UTF-8
- Preserve Vietnamese characters in all operations

### Common Filename Patterns
- **[SM-M2W]** - Service Management prefix for M2W client documents
- **TIEPNHAN** - Intake/handover documents
- **WATERBUS** - Client-specific prefix
- **FINAL** - Finalized versions
- **Date format:** YYYYMMDD at start of filename (e.g., 20251013_...)

### Document Types
- **.osheet** - OnlyOffice Spreadsheet format
- **.xlsx** - Microsoft Excel format
- **.odoc** - OnlyOffice Document format
- **.docx** - Microsoft Word format
- **.pdf** - PDF documents

## Working with This Repository

### Key Reference Documents
1. **Start with WATERBUS_KNOWLEDGE_BASE.md** for comprehensive system overview
2. **Check TIMELINE files** for project status and planning
3. **Review FINAL/** subdirectory for authoritative configuration data
4. **Reference contract files** in HOP DONG directory for service scope

### Data Sources
- **PC Configuration Data:** Located in `1. HIEN TRANG VA TIEP NHAN/FINAL/`
  - `WATERBUS-BẾN TÀU-THÔNG TIN PC-INTERNET.xlsx` - Terminal PCs
  - `WATERBUS-VĂN PHÒNG-THÔNG TIN PC-INTERNET.xlsx` - Office PCs
- **Migration Data:** Domain and email lists in FINAL/ subdirectory
- **Survey Data:** Comprehensive IT assessment documents in FINAL/

### Service Management Framework
This client follows ITIL4 service lifecycle:
- **Service Strategy** - Defined in contract documents
- **Service Design** - System planning directory
- **Service Transition** - Intake and handover process (currently active)
- **Service Operation** - Operations, monitoring, backup directories
- **Continual Service Improvement** - Service quality surveys

## Contract and Financial Information

### Service Agreement Details
- **Contract:** [SM-M2W] Hop dong dich vụ IT.pdf
- **Appendix:** [SM-M2W] Phu luc hop dong.pdf
- **NDA:** [SM-M2W] Thoa thuan bao mat NDA.pdf

### Payment Terms
- **Initial Payment (Đợt 1):** 38.880.000 VNĐ (within 7 days after contract signing)
- **Monthly Payment (Đợt 2):** 19.440.000 VNĐ/month (within 7 days after receiving invoice)
- **Invoice Date:** 1st of each month
- **Onsite Overtime Fee:** 1.650.000 VNĐ per incident (requires email approval from both parties)

### Service Scope
- **Support Equipment:** 50 PCs/Laptops, 4 Photocopiers, 1 PBX, 100 Cameras, 7 Printers
- **IT Team:** 1x IT Helpdesk, 1x IT System Admin, 1x Admin IT, 1x Account Project, 1x IT Manager
- **Support Hours:**
  - Online: 01 hour maximum response time
  - Onsite: Monday-Saturday 8:00 AM - 11:30 AM & 1:00 PM - 5:30 PM (Complexity level 06 hours)
  - Onsite: Monday-Saturday 8:00 AM - 11:30 AM & 1:00 PM - 5:30 PM (Complexity level 04 hours)
  - Onsite: Fully completed (Complexity level 08 hours)
- **Support Channels:** Email, Phone, Webform, Chat (Mstar_M2W_M-TechCare group)

## Important Notes

### Current Project Phase
The project is in the **intake and transition phase** as of 2025, with most documentation in the "HIEN TRANG VA TIEP NHAN" (current status and intake) directory.

### Multi-Site Operations
This client has distributed infrastructure across 6+ physical locations (ferry terminals) plus a central office, requiring coordinated IT support across multiple sites.

### Security Considerations
- All PCs have TPM 2.0 and Secure Boot enabled
- NDA in place - maintain confidentiality of client information
- Domain and email migration data contains sensitive information

### Documentation Standards
- Maintain consistency with M-TECHCARE service delivery standards
- Use Vietnamese language with proper encoding
- Follow ITIL4 structure for new documentation
- Reference parent CLAUDE.md at repository root for organizational standards

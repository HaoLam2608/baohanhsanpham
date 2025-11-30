Hướng dẫn Backup & Restore (local + GitHub Actions)

Mô tả ngắn
- Repo đã có `scripts/backup.js` và `scripts/restore.js` dùng `mongodump` / `mongorestore` (hoặc Docker image `mongo:6.0`) để tạo và khôi phục archive gzip trong thư mục `be/backup/`.
- `package.json` trong `be/` đã chứa hai script tiện lợi:
  - `npm run backup` — chạy `node scripts/backup.js`
  - `npm run restore` — chạy `node scripts/restore.js`

Yêu cầu
- Cài đặt Node.js và npm
- (Để chạy trực tiếp) Cài đặt MongoDB Database Tools (`mongodump`, `mongorestore`) trên PATH hoặc có Docker để chạy image `mongo:6.0` (workflow dùng Docker)

Chạy backup (local)
1. Mở PowerShell / terminal và chuyển vào thư mục `be`:

```powershell
cd 'd:\HOC KI 7\NoSQL\doan_bhsp\be'
```

2. (Tùy chọn) Đặt `MONGO_URI` tạm thời nếu DB không ở localhost:

```powershell
$env:MONGO_URI = 'mongodb://user:pass@host:27017/dbname'
```

3. Chạy:

```powershell
npm run backup
```

4. Kiểm tra thư mục `backup/` để thấy file `db-<timestamp>.archive.gz`.

Chạy restore (local)
1. (Quan trọng) Kiểm tra bạn muốn xóa DB hiện tại trước khi khôi phục. `restore.js` sử dụng `--drop`.
2. Chạy:

```powershell
npm run restore
# hoặc restore file cụ thể
node scripts/restore.js .\backup\db-2025-11-25T09-47-48-667Z.archive.gz
```

GitHub Actions (automated backup)
- Workflow: `be/.github/workflows/backup.yml` (đã cấu hình schedule và có `workflow_dispatch` để run thủ công).
- Yêu cầu: repository secret `MONGO_URI` cần được thiết lập (Settings → Secrets & variables → Actions).
- Nếu DB là `localhost` hoặc host private, GitHub-hosted runner sẽ không thể kết nối; giải pháp: sử dụng self-hosted runner trong cùng mạng hoặc chạy backup bằng cron trên server nội bộ.

Debug khi workflow thất bại
- Mình đã thêm bước kiểm tra `MONGO_URI` và liệt kê `$RUNNER_TEMP` để dễ tìm file archive.
- Khi workflow thất bại, mở Actions → chọn run → mở step `Run mongodump inside mongo container` và `List runner temp files (debug)` để xem lỗi chi tiết.

Gợi ý an toàn
- Lưu trữ bản backup ra nơi an toàn (không để trên cùng server sản xuất nếu không cần thiết).
- Nếu lưu artifact trên GitHub, artifact có hạn chế kích thước và thời gian giữ (retention).

Nếu bạn muốn tôi tự động thêm các bước bổ sung (ví dụ: rotate backups, upload tới S3, hoặc thêm npm script git pre-commit) hãy nói rõ và tôi sẽ patch repo.
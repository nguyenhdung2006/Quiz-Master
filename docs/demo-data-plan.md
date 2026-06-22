# Phase 6.0 - Content & Demo Data Scope Freeze

## 1. Mục tiêu Phase 6

Phase 6 chuẩn bị một bộ dữ liệu demo sạch, có chủ đích cho môi trường local/demo để QuizMaster mở ra với nội dung hữu ích thay vì trạng thái trống. Dữ liệu phải đủ để người dùng khám phá và làm quiz, đồng thời đủ để admin trình diễn các luồng quản lý hiện có mà không tạo thêm tính năng giả.

Phase 6.0 chỉ đóng băng phạm vi và kế hoạch dữ liệu. Bước này không triển khai seed, không chèn dữ liệu vào cơ sở dữ liệu và không thay đổi mã backend/frontend.

## 2. Phạm vi

### Trong phạm vi

- Danh mục demo.
- Quiz demo công khai.
- Quiz demo ở trạng thái nháp.
- Tài khoản admin/user demo.
- Câu hỏi single-choice được biên soạn có chọn lọc.
- Giải thích cho từng câu hỏi.
- Chiến lược seed an toàn, lặp lại được.
- Lịch sử/lượt làm bài demo tùy chọn.

### Ngoài phạm vi

- Đăng nhập Google/Facebook.
- Bảng xếp hạng.
- Thành tích.
- Dashboard phân tích dành cho admin.
- Import Excel.
- Upload hình ảnh.
- Thanh toán/nâng cấp.
- Lớp học hoặc tính năng xã hội.
- Câu hỏi multi-choice.
- Ngân hàng câu hỏi lớn.
- Sinh câu hỏi bằng AI.

## 3. Danh mục demo đề xuất

Bộ danh mục ban đầu:

- Java Core
- Spring Boot
- SQL & Database
- Computer Networking
- Software Engineering
- English for IT

Tên danh mục cần nhất quán giữa nguồn nội dung, seeder và giao diện. Chưa mở rộng thêm danh mục trước khi hoàn tất QA cho bộ ban đầu.

## 4. Quiz công khai đề xuất

Mục tiêu ban đầu là 5-6 quiz công khai, mỗi quiz có 6-10 câu hỏi. Không tạo ngân hàng 100+ câu hỏi ở giai đoạn này.

| Quiz | Danh mục | Thời gian đề xuất | Số câu mục tiêu | Trọng tâm học tập | Trạng thái |
| --- | --- | ---: | ---: | --- | --- |
| Java Core Basics | Java Core | 10 phút | 8 | Kiểu dữ liệu, OOP, collection, exception và ngữ nghĩa Java cơ bản | Public |
| Spring Boot Essentials | Spring Boot | 10 phút | 8 | Dependency injection, cấu hình, bean, REST controller và convention cơ bản | Public |
| SQL Basics | SQL & Database | 10 phút | 8 | SELECT, JOIN, GROUP BY, khóa và transaction cơ bản | Public |
| Networking Fundamentals | Computer Networking | 10 phút | 8 | Mô hình mạng, TCP/UDP, HTTP, DNS và địa chỉ IP | Public |
| Software Engineering Basics | Software Engineering | 10 phút | 8 | SDLC, Git, kiểm thử, yêu cầu và nguyên tắc thiết kế cơ bản | Public |
| English for IT Basics | English for IT | 8 phút | 6 | Từ vựng và cách hiểu thông báo kỹ thuật phổ biến | Public |

Số câu trên là mục tiêu nội dung, có thể điều chỉnh trong khoảng 6-10 câu khi biên tập ở Phase 6.1, nhưng không thay đổi phạm vi chủ đề hoặc bổ sung tính năng.

## 5. Dữ liệu quản lý dành cho admin

Bộ dữ liệu admin cần hỗ trợ trình diễn các trạng thái quản lý hiện có:

- 1 quiz public có nội dung hoàn chỉnh để xem, nhưng không thể chỉnh sửa cấu trúc sau khi đã publish theo quy tắc hiện tại.
- 1 quiz draft có sẵn câu hỏi để admin trình diễn chỉnh sửa nội dung.
- 1 quiz draft trống để trình diễn kiểm tra hợp lệ khi publish.
- 1 quiz bị khóa cấu trúc do đã có lịch sử submitted attempt, nếu việc seed attempt khả thi và an toàn ở bước sau.

Quiz bị khóa phụ thuộc vào khả năng seed attempt nhất quán với mô hình dữ liệu và logic chấm điểm. Nếu chưa bảo đảm, mục này phải được hoãn thay vì tạo trạng thái giả hoặc dữ liệu không hợp lệ.

## 6. Tài khoản demo

| Mục đích | Email | Mật khẩu local/demo | Vai trò |
| --- | --- | --- | --- |
| Admin demo | `demo-admin@quizmaster.local` | `password123` | `ADMIN` |
| User demo chính | `demo-user@quizmaster.local` | `password123` | `USER` |
| User không có attempt (tùy chọn) | `demo-empty@quizmaster.local` | `password123` | `USER` |

Quy tắc an toàn:

- Các tài khoản này chỉ dành cho môi trường local/demo.
- Không dùng email thật hoặc thông tin nhận dạng cá nhân.
- Không dùng production secret.
- Khi seeder được triển khai, mật khẩu phải được backend hash bằng cùng cơ chế hợp lệ mà ứng dụng đang sử dụng; không lưu plaintext trong cơ sở dữ liệu.

## 7. Kế hoạch attempt/lịch sử demo

- `demo-user@quizmaster.local` dự kiến có 1-2 submitted attempts.
- Attempts phải giúp các trang My Attempts, Result và Review hiển thị dữ liệu có ý nghĩa.
- Submitted attempts cũng có thể tạo trạng thái `structuralEditingLocked` để trình diễn quy tắc khóa chỉnh sửa cấu trúc.
- Không seed quá nhiều attempts; 1-2 bản ghi được biên soạn và kiểm tra là đủ.
- Điểm số, câu trả lời đã chọn, trạng thái nộp bài và dữ liệu review phải nhất quán với logic chấm điểm hiện tại.
- Nếu seed attempt quá rủi ro cho phiên bản seed đầu tiên, hoãn sang Phase 6.3 hoặc muộn hơn; ưu tiên dữ liệu quiz đúng hơn dữ liệu lịch sử giả.

## 8. Quy tắc chất lượng câu hỏi

Mọi câu hỏi demo phải đáp ứng:

- Chỉ single-choice.
- Chính xác một phương án đúng.
- Ưu tiên 4 phương án.
- Câu chữ rõ ràng, không mơ hồ.
- Không dùng nội dung đùa, lấp chỗ trống hoặc vô nghĩa.
- Bắt buộc có giải thích.
- Giải thích dài 1-3 câu, nêu lý do đáp án đúng và làm rõ nhầm lẫn phổ biến khi cần.
- API public không được để lộ đáp án đúng hoặc giải thích trước khi luồng hiện tại cho phép.
- Nội dung câu hỏi và phương án phải dễ đọc, súc tích.

### Ví dụ câu hỏi đạt yêu cầu

**Câu hỏi:** Trong Java, collection nào không cho phép phần tử trùng lặp?

- A. `List`
- B. `Set`
- C. `Queue`
- D. `ArrayList`

**Đáp án đúng:** B. `Set`

**Giải thích:** `Set` biểu diễn một tập hợp các phần tử duy nhất nên không lưu phần tử trùng lặp. `List` và `ArrayList` cho phép các phần tử có cùng giá trị.

Đáp án và giải thích trong nguồn nội dung/seeder chỉ phục vụ tạo dữ liệu và chấm/review đúng quyền; chúng không được xuất hiện trong payload quiz công khai trước khi người dùng nộp bài.

## 9. Khuyến nghị chiến lược seed

Nên triển khai một `DemoDataSeeder` bằng Java trong Phase 6.2 với các đặc tính:

- Chỉ chạy khi bật profile demo hoặc property tường minh.
- Idempotent và an toàn khi chạy nhiều lần.
- Kiểm tra email, slug hoặc title ổn định trước khi tạo bản ghi.
- Không tạo bản ghi trùng lặp khi khởi động lại ứng dụng.
- Không chạy mặc định trong môi trường test hoặc production.
- Không sử dụng `data.sql` mặc định toàn cục.
- Dùng service/repository và password encoder phù hợp với kiến trúc backend hiện tại.

Các tùy chọn cấu hình cần đánh giá khi triển khai:

- `app.seed-demo=true`
- `spring.profiles.active=demo`
- `backend/src/main/resources/application-demo.properties`

Khuyến nghị dùng profile `demo` kết hợp property `app.seed-demo=true` để yêu cầu ý định rõ ràng trước khi seed. Tên property và vị trí tích hợp cuối cùng phải được đối chiếu với cấu hình hiện tại ở Phase 6.2. Phase 6.0 không triển khai bất kỳ lựa chọn nào trong số này.

## 10. Lộ trình triển khai Phase 6

1. **6.0 Demo data scope freeze:** Chốt mục tiêu, phạm vi, quy tắc chất lượng, chiến lược và tiêu chí hoàn thành.
2. **6.1 Create demo content source of truth:** Biên soạn nguồn nội dung chuẩn cho danh mục, quiz, câu hỏi, phương án và giải thích.
3. **6.2 Implement idempotent demo seeder:** Tạo seeder Java có điều kiện, lặp lại được và không chạy mặc định.
4. **6.3 Seed initial categories/accounts/quizzes:** Seed danh mục, tài khoản và các quiz public/draft ban đầu.
5. **6.4 Add curated questions/explanations:** Thêm câu hỏi được biên tập cùng giải thích, đồng thời xác minh an toàn payload public.
6. **6.5 Optional seed submitted attempts/history:** Chỉ seed lịch sử nếu có thể giữ dữ liệu nhất quán với logic chấm điểm và khóa cấu trúc.
7. **6.6 Demo data QA:** Kiểm tra nội dung, quyền, idempotency, luồng làm bài, kết quả/review/history và regression.
8. **6.7 Final demo reset/run instructions:** Viết hướng dẫn reset và chạy demo có thể lặp lại.

## 11. Definition of Done của Phase 6

Phase 6 hoàn thành khi:

- Catalog có các quiz public hữu ích.
- Admin có thể quản lý dữ liệu demo bằng các tính năng hiện có.
- Demo user có thể làm quiz.
- Demo user có thể xem kết quả, review và lịch sử.
- Ứng dụng không còn cảm giác trống khi mở ở môi trường demo.
- Seed có thể chạy lặp lại mà không tạo dữ liệu trùng.
- Backend tests pass.
- Frontend build pass.
- An toàn API public được giữ nguyên: không lộ đáp án đúng hoặc giải thích ngoài thời điểm/quyền được phép.
- Git clean sau khi hoàn tất và commit các thay đổi dự kiến.

## 12. Rủi ro và cảnh báo

- **Viết quá nhiều câu hỏi quá sớm:** Làm tăng khối lượng biên tập và QA; giữ giới hạn 6-10 câu/quiz cho bộ đầu tiên.
- **Seeder tạo bản ghi trùng:** Dùng định danh ổn định và kiểm tra tồn tại trước khi tạo; kiểm thử chạy seed nhiều lần.
- **Demo seed vô tình chạy trong production/test:** Seeder phải bị tắt mặc định và có điều kiện profile/property tường minh.
- **Dữ liệu giả bị dùng trong tuyên bố sản phẩm:** Gắn rõ dữ liệu/tài khoản là local/demo, không trình bày chúng như dữ liệu người dùng thật hoặc quy mô sản phẩm thật.
- **Seeded attempts không nhất quán với logic chấm điểm:** Tạo attempt qua domain/service phù hợp hoặc hoãn seed attempt đến khi có cách an toàn.
- **Dùng email hoặc mật khẩu thật:** Chỉ dùng địa chỉ `.local` đã chốt và mật khẩu demo; backend phải hash mật khẩu khi seed.
- **Trộn thiết kế giao diện với công việc dữ liệu demo:** Phase 6 không phải đợt redesign; mọi thay đổi phải tập trung vào nội dung, seed và QA dữ liệu.

## Quyết định đóng băng phạm vi 6.0

Tài liệu này là nguồn định hướng phạm vi cho Phase 6. Mọi đề xuất ngoài danh sách trong phạm vi phải được hoãn sang phase khác; đặc biệt không bổ sung dashboard/statistics, upload/import, OAuth, leaderboard, payment, classroom/social hoặc multi-choice trong quá trình làm dữ liệu demo.

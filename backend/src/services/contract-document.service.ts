import { createHash } from "node:crypto";

interface ContractDocumentInput {
  id: string;
  contractCode: string;
  customerId: string;
  packageId: string;
  menuComboId: string | null;
  hostName: string;
  hostPhone: string;
  tableCount: number;
  setupDate: Date;
  eventDate: Date;
  address: string;
  formattedAddress: string | null;
  totalAmount: unknown;
  depositRate: unknown;
  depositAmount: unknown;
  items: Array<{ itemName: string; quantity: number; unitPrice: unknown; lineTotal: unknown }>;
  menuItems: Array<{ originalDishName: string; selectedDishName: string; isReplacement: boolean; sortOrder: number }>;
}

export const contractDocumentHash = (contract: ContractDocumentInput) => {
  const snapshot = {
    id: contract.id,
    contractCode: contract.contractCode,
    customerId: contract.customerId,
    packageId: contract.packageId,
    menuComboId: contract.menuComboId,
    hostName: contract.hostName,
    hostPhone: contract.hostPhone,
    tableCount: contract.tableCount,
    setupDate: contract.setupDate.toISOString(),
    eventDate: contract.eventDate.toISOString(),
    address: contract.formattedAddress ?? contract.address,
    totalAmount: String(contract.totalAmount),
    depositRate: String(contract.depositRate),
    depositAmount: String(contract.depositAmount),
    items: contract.items.map((item) => ({ name: item.itemName, quantity: item.quantity, unitPrice: String(item.unitPrice), lineTotal: String(item.lineTotal) })),
    menuItems: [...contract.menuItems].sort((a, b) => a.sortOrder - b.sortOrder).map((item) => ({ original: item.originalDishName, selected: item.selectedDishName, replacement: item.isReplacement })),
  };
  return createHash("sha256").update(JSON.stringify(snapshot)).digest("hex");
};

export const contractArticles = [
  {
    title: "ĐIỀU 1. NỘI DUNG HỢP ĐỒNG",
    paragraphs: [
      "Bên A đồng ý chọn Bên B thực hiện tổ chức sự kiện đám cưới tại địa điểm và thời gian ghi trong hợp đồng.",
      "Bên B chuẩn bị chương trình từ khâu lên ý tưởng đến hoàn tất sự kiện; hỗ trợ đón khách, bố trí chỗ ngồi, chuẩn bị thực đơn và điều phối chương trình.",
      "Bảng kê dịch vụ, thực đơn và các phụ lục được hai bên xác nhận là phần không tách rời của hợp đồng.",
    ],
  },
  {
    title: "ĐIỀU 2. GIÁ CẢ VÀ PHƯƠNG THỨC THANH TOÁN",
    paragraphs: [
      "Giá trị dịch vụ, tiền đặt cọc và số tiền còn lại được thể hiện trong phần thông tin tài chính của hợp đồng.",
      "Bên A thanh toán bằng tiền mặt hoặc chuyển khoản. Đợt 1 đặt cọc 50% sau khi ký; đợt 2 thanh toán phần còn lại sau nghiệm thu, đối chiếu phát sinh và thanh lý hợp đồng.",
      "Mọi hạng mục bỏ bớt hoặc phát sinh phải được hai bên chấp thuận trước và được ghi nhận trong biên bản nghiệm thu hoặc phụ lục.",
    ],
  },
  {
    title: "ĐIỀU 3. THỜI HẠN THỰC HIỆN",
    paragraphs: [
      "Hợp đồng có hiệu lực từ thời điểm ký điện tử đến khi hai bên hoàn thành nghĩa vụ và thanh toán.",
      "Nếu một bên vi phạm hợp đồng hoặc phụ lục liên quan, bên còn lại có quyền chấm dứt theo quy định và yêu cầu bồi thường thiệt hại thực tế.",
    ],
  },
  {
    title: "ĐIỀU 4. QUYỀN VÀ NGHĨA VỤ CỦA BÊN A",
    paragraphs: [
      "Cung cấp thông tin, ý tưởng và nội dung cần thiết; phối hợp, tạo điều kiện để Bên B triển khai công việc.",
      "Quản lý, giám sát, nghiệm thu và phối hợp xử lý các vấn đề thuộc trách nhiệm của Bên A trong thời gian diễn ra chương trình.",
      "Thay đổi số lượng bàn phải báo trước tối thiểu 03 ngày và mức tăng hoặc giảm không vượt quá 10% số lượng đã đặt, trừ khi hai bên có thỏa thuận khác.",
      "Thanh toán đầy đủ, đúng thời hạn; cử đầu mối liên lạc có mặt trước giờ bàn giao để phối hợp giải quyết phát sinh.",
    ],
  },
  {
    title: "ĐIỀU 5. QUYỀN VÀ NGHĨA VỤ CỦA BÊN B",
    paragraphs: [
      "Thực hiện đúng nội dung, tiến độ, chất lượng đã thống nhất và chủ động điều phối các bộ phận phục vụ chương trình.",
      "Bảo vệ tài sản của Bên A trong phạm vi công việc; bảo mật thông tin của Bên A và không cung cấp cho bên thứ ba nếu chưa được đồng ý.",
      "Bàn giao đầy đủ hạng mục trong báo giá; phối hợp giải quyết phát sinh và chịu trách nhiệm đối với phần công việc do lỗi của Bên B.",
      "Bên B không chịu trách nhiệm đối với sự cố do Bên A hoặc sự kiện bất khả kháng như thiên tai, hỏa hoạn, bão lũ khiến chương trình không thể tiếp tục an toàn.",
    ],
  },
  {
    title: "ĐIỀU 6. CHẤM DỨT VÀ GIẢI QUYẾT TRANH CHẤP",
    paragraphs: [
      "Hợp đồng chấm dứt khi hai bên hoàn thành nghĩa vụ, cùng thỏa thuận chấm dứt hoặc có căn cứ chấm dứt theo pháp luật.",
      "Các bên ưu tiên thương lượng. Nếu không giải quyết được, tranh chấp được đưa đến Tòa án có thẩm quyền tại Việt Nam.",
    ],
  },
  {
    title: "ĐIỀU 7. ĐIỀU KHOẢN CHUNG",
    paragraphs: [
      "Hai bên cam kết thông tin cung cấp là đúng và thực hiện đầy đủ các điều khoản cùng phụ lục.",
      "Hợp đồng điện tử có hiệu lực từ thời điểm Bên A ký và được hệ thống ghi nhận; mỗi bên có quyền lưu một bản PDF để thực hiện.",
    ],
  },
];

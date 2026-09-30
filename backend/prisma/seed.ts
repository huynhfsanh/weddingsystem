import bcrypt from "bcryptjs";
import { PrismaClient, type CatalogType, type RoleCode } from "@prisma/client";
import { menuSeeds } from "./menu-data.js";

const prisma = new PrismaClient();

const roles: Array<{ code: RoleCode; name: string }> = [
  { code: "ADMIN", name: "Quan tri vien" },
  { code: "STAFF", name: "Nhan vien" },
  { code: "CUSTOMER", name: "Khach hang" },
];

const catalogs: Array<{ name: string; type: CatalogType; unit: string; unitPrice: number; description: string }> = [
  { name: "Rap cuoi", type: "EQUIPMENT", unit: "bo", unitPrice: 6000000, description: "Rap cuoi chac chan, phu hop khong gian tai gia." },
  { name: "Ban ghe", type: "EQUIPMENT", unit: "ban", unitPrice: 350000, description: "Ban ghe kem ao ghe va no trang tri." },
  { name: "Ban gia tien", type: "DECORATION", unit: "bo", unitPrice: 3500000, description: "Trang tri ban gia tien dong bo." },
  { name: "Hoa trang tri", type: "DECORATION", unit: "goi", unitPrice: 4500000, description: "Hoa tuoi va hoa cao cap theo chu de." },
  { name: "San khau", type: "EQUIPMENT", unit: "bo", unitPrice: 5000000, description: "San khau, phong nen va bang ten." },
  { name: "Am thanh", type: "SERVICE", unit: "goi", unitPrice: 4000000, description: "He thong am thanh va ky thuat vien." },
  { name: "Anh sang", type: "SERVICE", unit: "goi", unitPrice: 3000000, description: "Anh sang san khau va khong gian." },
  { name: "MC", type: "SERVICE", unit: "ca", unitPrice: 2500000, description: "MC dan chuong trinh tiec cuoi." },
  { name: "Chup anh", type: "SERVICE", unit: "goi", unitPrice: 5000000, description: "Nhiep anh gia va album anh so." },
  { name: "Quay phim", type: "SERVICE", unit: "goi", unitPrice: 6500000, description: "Quay phim va video highlight." },
  { name: "Mon khai vi", type: "FOOD", unit: "ban", unitPrice: 450000, description: "Khai vi theo thuc don da chon." },
  { name: "Mon chinh", type: "FOOD", unit: "ban", unitPrice: 2200000, description: "Thuc don mon chinh cho mot ban." },
  { name: "Mon trang mieng", type: "FOOD", unit: "ban", unitPrice: 300000, description: "Trai cay hoac che trang mieng." },
  { name: "Nuoc uong", type: "FOOD", unit: "ban", unitPrice: 300000, description: "Nuoc ngot va nuoc suoi." },
  { name: "Van chuyen", type: "TRANSPORT", unit: "chuyen", unitPrice: 2000000, description: "Van chuyen trong ban kinh tieu chuan." },
  { name: "Phuc vu", type: "SERVICE", unit: "nhan vien", unitPrice: 500000, description: "Nhan vien phuc vu tiec." },
];

const packages = [
  { name: "Goi Tiet kiem", slug: "goi-tiet-kiem", style: "Toi gian", basePrice: 28000000, standardTables: 15, isFeatured: false, imageUrl: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1600&q=85", description: "Lua chon gon gang, am cung cho tiec cuoi quy mo nho." },
  { name: "Goi Truyen thong", slug: "goi-truyen-thong", style: "Truyen thong", basePrice: 42000000, standardTables: 20, isFeatured: true, imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=85", description: "Khong gian trang trong voi day du nghi le va dich vu can thiet." },
  { name: "Goi Rustic", slug: "goi-rustic", style: "Rustic", basePrice: 56000000, standardTables: 20, isFeatured: true, imageUrl: "https://images.unsplash.com/photo-1507504031003-b417219a0fde?auto=format&fit=crop&w=1600&q=85", description: "Chat lieu moc, hoa la tu nhien va khong gian gan gui." },
  { name: "Goi Hien dai", slug: "goi-hien-dai", style: "Hien dai", basePrice: 72000000, standardTables: 25, isFeatured: true, imageUrl: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1600&q=85", description: "Thiet ke thanh lich, anh sang tinh te va quy trinh chuyen nghiep." },
  { name: "Goi VIP", slug: "goi-vip", style: "Sang trong", basePrice: 120000000, standardTables: 30, isFeatured: true, imageUrl: "https://images.unsplash.com/photo-1544078751-58fee2d8a03b?auto=format&fit=crop&w=1600&q=85", description: "Trai nghiem tron goi cao cap voi trang tri va dich vu ca nhan hoa." },
];

const galleryImages = [
  { url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1600&q=85", altText: "Cặp đôi trong không gian tiệc cưới" },
  { url: "https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?auto=format&fit=crop&w=1600&q=85", altText: "Bàn tiệc cưới được trang trí tinh tế" },
  { url: "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=1600&q=85", altText: "Không gian lễ cưới trang trọng" },
  { url: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1600&q=85", altText: "Hoa và bàn tiệc trong ngày cưới" },
  { url: "https://images.unsplash.com/photo-1505944357431-27579db47558?auto=format&fit=crop&w=1600&q=85", altText: "Trang trí tiệc cưới ngoài trời" },
  { url: "https://images.unsplash.com/photo-1494955870715-979ca4f13bf0?auto=format&fit=crop&w=1600&q=85", altText: "Khoảnh khắc trong lễ cưới" },
];

const faqs: Array<[string, string, string]> = [
  ["Tien coc bao nhieu?", "Tien coc mac dinh la 50% tong gia tri hop dong. Khach hang ky dien tu truoc khi thanh toan dat coc.", "tien coc,coc,50%,ky dien tu"],
  ["Quy trinh dat tiec", "Ban chon goi, tuy bien dich vu, chon ngay va dia diem, xac nhan hop dong, sau do chuyen khoan tien coc.", "quy trinh,dat tiec,dat cuoi"],
  ["Chinh sach huy", "Chinh sach huy duoc ghi ro trong hop dong. Muc hoan coc phu thuoc thoi diem huy va chi duoc xac nhan boi quan tri vien.", "huy,hoan coc"],
  ["Chinh sach doi mon", "Ban co the dieu chinh mon an truoc khi hop dong duoc chot. Gia se duoc backend tinh lai theo danh muc hien hanh.", "doi mon,mon an,thuc don"],
  ["Thoi gian dat tiec", "Nen dat truoc toi thieu 30 ngay. Kha nang nhan tiec con phu thuoc capacity cua ngay cu the.", "dat truoc,thoi gian"],
  ["Thanh toan bang Casso", "He thong dung Casso de nhan webhook va doi soat giao dich chuyen khoan. Ban can ghi dung noi dung thanh toan.", "casso,chuyen khoan,thanh toan"],
  ["Quy trinh nghiem thu", "Nhan vien check-in kem anh truoc thi cong, check-out kem anh sau ban giao, sau do quan tri vien duyet nghiem thu.", "nghiem thu,check-in,check-out"],
  ["Chinh sach hu hai", "Hu hai phai co anh va mo ta. Quan tri vien xem xet, lap chi phi va xac nhan phuong an xu ly.", "hu hai,boi thuong"],
  ["Thoi gian hoan tien", "Thoi gian hoan tien phu thuoc trang thai hop dong va ket qua doi soat. Quan tri vien se thong bao tren he thong.", "hoan tien"],
  ["Cach xem hop dong", "Sau khi dang nhap, mo muc Hop dong cua toi de xem chi tiet, thanh toan va tai ban PDF.", "xem hop dong,pdf"],
];

const menuImageForDish = (name: string) => {
  const value = name.toLocaleLowerCase("vi-VN");
  if (/súp|soup|canh|lẩu/.test(value)) return "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=85";
  if (/gỏi|nộm|salad/.test(value)) return "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=85";
  if (/gà|ngỗng/.test(value)) return "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=900&q=85";
  if (/tôm|mực|cá|hải sản/.test(value)) return "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=900&q=85";
  if (/bò|chân giò|thịt/.test(value)) return "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=85";
  if (/chè|rau câu|trái cây/.test(value)) return "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=900&q=85";
  return "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=85";
};

async function main() {
  for (const role of roles) await prisma.role.upsert({ where: { code: role.code }, update: role, create: role });
  const roleRows = await prisma.role.findMany();
  const roleId = (code: RoleCode) => roleRows.find((item) => item.code === code)!.id;
  const passwordHash = await bcrypt.hash("Wedding@123", 12);
  for (const user of [
    { email: "admin@example.com", fullName: "Quan tri vien", role: "ADMIN" as RoleCode },
    { email: "staff1@example.com", fullName: "Nguyen Minh Anh", role: "STAFF" as RoleCode },
    { email: "staff2@example.com", fullName: "Tran Bao Chau", role: "STAFF" as RoleCode },
    { email: "customer@example.com", fullName: "Khach hang mau", role: "CUSTOMER" as RoleCode },
  ]) await prisma.user.upsert({ where: { email: user.email }, update: { fullName: user.fullName, roleId: roleId(user.role) }, create: { email: user.email, fullName: user.fullName, roleId: roleId(user.role), passwordHash, phone: "0799392717" } });

  for (const item of catalogs) await prisma.catalogItem.upsert({ where: { name_type: { name: item.name, type: item.type } }, update: item, create: item });
  await prisma.catalogItem.updateMany({ where: { type: "FOOD", name: { in: ["Mon khai vi", "Mon chinh", "Mon trang mieng", "Nuoc uong", "Món khai vị", "Món chính", "Món tráng miệng", "Nước uống"] } }, data: { isActive: false } });
  const foodAndDrink = await prisma.catalogItem.upsert({
    where: { name_type: { name: "Đồ ăn và thức uống", type: "FOOD" } },
    update: { description: "Combo thực đơn và thức uống được chọn cho tiệc cưới.", unit: "gói", unitPrice: 3250000, isActive: true },
    create: { name: "Đồ ăn và thức uống", type: "FOOD", description: "Combo thực đơn và thức uống được chọn cho tiệc cưới.", unit: "gói", unitPrice: 3250000 },
  });
  for (const item of packages) await prisma.weddingPackage.upsert({ where: { slug: item.slug }, update: item, create: item });
  const packageRows = await prisma.weddingPackage.findMany();
  const catalogRows = await prisma.catalogItem.findMany();
  for (const [packageIndex, weddingPackage] of packageRows.entries()) {
    await prisma.packageCatalogItem.updateMany({ where: { packageId: weddingPackage.id }, data: { isRequired: false } });
    for (const catalogItem of catalogRows.filter((item) => ["Rap cuoi", "Ban ghe", "Hoa trang tri", "San khau", "Am thanh"].includes(item.name))) {
      await prisma.packageCatalogItem.upsert({ where: { packageId_catalogItemId: { packageId: weddingPackage.id, catalogItemId: catalogItem.id } }, update: { isRequired: false }, create: { packageId: weddingPackage.id, catalogItemId: catalogItem.id, quantity: 1, isRequired: false } });
    }
    await prisma.packageCatalogItem.upsert({ where: { packageId_catalogItemId: { packageId: weddingPackage.id, catalogItemId: foodAndDrink.id } }, update: { quantity: 1, isRequired: false }, create: { packageId: weddingPackage.id, catalogItemId: foodAndDrink.id, quantity: 1, isRequired: false } });
    const candidates = [
      { url: weddingPackage.imageUrl!, altText: `Ảnh đại diện ${weddingPackage.name}` },
      ...galleryImages.slice(packageIndex),
      ...galleryImages.slice(0, packageIndex),
    ].filter((image, index, values) => image.url && values.findIndex((candidate) => candidate.url === image.url) === index).slice(0, 5);
    for (const [imageIndex, image] of candidates.entries()) {
      const id = `gallery_${weddingPackage.slug}_${imageIndex + 1}`;
      await prisma.packageImage.upsert({
        where: { id },
        update: { url: image.url, altText: image.altText, sortOrder: imageIndex },
        create: { id, packageId: weddingPackage.id, url: image.url, altText: image.altText, sortOrder: imageIndex, isCover: imageIndex === 0 },
      });
    }
  }
  for (const [jobName, amount] of [["Dung rap", 500000], ["Thao rap", 500000], ["Trang tri gia tien", 700000], ["Trang tri san khau", 800000], ["Am thanh anh sang", 900000], ["Chup anh", 1500000], ["Quay phim", 1800000], ["MC", 2000000], ["Phuc vu", 450000], ["Van chuyen", 600000]] as const) {
    await prisma.staffRate.upsert({ where: { jobName }, update: { amount }, create: { jobName, amount } });
  }
  for (const comboSeed of menuSeeds) {
    const combo = await prisma.menuCombo.upsert({
      where: { code: comboSeed.code },
      update: { name: comboSeed.name, groupName: comboSeed.groupName, sortOrder: comboSeed.sortOrder, isActive: true },
      create: { code: comboSeed.code, name: comboSeed.name, groupName: comboSeed.groupName, sortOrder: comboSeed.sortOrder },
    });
    for (const [index, dish] of comboSeed.dishes.entries()) {
      const id = `dish_${comboSeed.code.toLowerCase()}_${index + 1}`;
      await prisma.menuDish.upsert({
        where: { id },
        update: { comboId: combo.id, name: dish.name, referenceUrl: dish.referenceUrl, imageUrl: menuImageForDish(dish.name), sortOrder: index, isActive: true },
        create: { id, comboId: combo.id, name: dish.name, referenceUrl: dish.referenceUrl, imageUrl: menuImageForDish(dish.name), sortOrder: index },
      });
    }
  }
  for (const [question, answer, keywords] of faqs) {
    const existing = await prisma.chatbotFaq.findFirst({ where: { question } });
    if (existing) await prisma.chatbotFaq.update({ where: { id: existing.id }, data: { answer, keywords, isActive: true } });
    else await prisma.chatbotFaq.create({ data: { question, answer, keywords } });
  }
  console.log("Da tao du lieu mau. Mat khau demo: Wedding@123");
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());

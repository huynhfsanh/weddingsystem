export interface MenuSeed {
  code: string;
  name: string;
  groupName: string;
  sortOrder: number;
  dishes: Array<{ name: string; referenceUrl?: string }>;
}

export const menuSeeds: MenuSeed[] = [
  {
    code: "BO1_TD1", name: "Thực đơn 1", groupName: "Bộ thực đơn 1", sortOrder: 101,
    dishes: [
      { name: "Súp cua nấm tuyết" },
      { name: "Gỏi ngó sen tôm thịt", referenceUrl: "https://www.bachhoaxanh.com/kinh-nghiem-hay/cach-lam-goi-ngo-sen-gion-ngon-1084621" },
      { name: "Tôm sú sốt Thượng Hải" },
      { name: "Gà hấp lá chanh", referenceUrl: "https://www.bachhoaxanh.com/kinh-nghiem-hay/cach-lam-ga-hap-la-chanh-thit-ngot-thom-tham-vi-1372825" },
      { name: "Bò xào thiên lý", referenceUrl: "https://www.bachhoaxanh.com/kinh-nghiem-hay/thit-bo-xao-hoa-thien-ly-mem-thom-hap-dan-cho-bua-com-trua-1194709" },
      { name: "Lẩu hải sản", referenceUrl: "https://www.bachhoaxanh.com/kinh-nghiem-hay/tong-hop-3-cach-nau-lau-hai-san-thom-ngon-tai-nha-1330480" },
      { name: "Rau câu 3 màu", referenceUrl: "https://www.bachhoaxanh.com/banh-caramen-banh-flan/rau-cau-3-mau-hoang-huong-hu-100g" },
    ],
  },
  {
    code: "BO1_TD2", name: "Thực đơn 2", groupName: "Bộ thực đơn 1", sortOrder: 102,
    dishes: [
      { name: "Gỏi ngó sen tôm thịt" },
      { name: "Gà bó xôi", referenceUrl: "https://www.bachhoaxanh.com/kinh-nghiem-hay/huong-dan-cach-lam-ga-bo-xoi-chien-phong-gion-ngon-1371913" },
      { name: "Cá tai tượng chiên xù", referenceUrl: "https://www.bachhoaxanh.com/kinh-nghiem-hay/cach-lam-ca-tai-tuong-chien-xu-sieu-de-sieu-ngon-1115189" },
      { name: "Lẩu hải sản" },
      { name: "Mực xào thập cẩm", referenceUrl: "https://www.bachhoaxanh.com/kinh-nghiem-hay/cach-lam-muc-xao-thap-cam-thom-ngon-hap-dan-tai-nha-1380794" },
      { name: "Rau câu trái cây", referenceUrl: "https://www.bachhoaxanh.com/rau-cau/thach-rau-cau-huong-trai-cay-nhiet-doi-trai-cay-new-choice" },
      { name: "Chè khúc bạch", referenceUrl: "https://www.bachhoaxanh.com/kinh-nghiem-hay/cach-lam-che-khuc-bach-sieu-ngon-giai-nhiet-1031511" },
    ],
  },
  {
    code: "BO1_TD3", name: "Thực đơn 3", groupName: "Bộ thực đơn 1", sortOrder: 103,
    dishes: [
      { name: "Chả giò hải sản", referenceUrl: "https://www.bachhoaxanh.com/kinh-nghiem-hay/cha-gio-hai-san-chien-xu-xot-mayonnaise-ngon-cuc-1229491" },
      { name: "Bò né bông thiên lý", referenceUrl: "https://www.bachhoaxanh.com/kinh-nghiem-hay/cach-lam-bo-ne-hoa-thien-ly-don-gian-thom-ngon-cuc-bo-duong-1373674" },
      { name: "Lẩu cá bóp măng chua", referenceUrl: "https://www.bachhoaxanh.com/kinh-nghiem-hay/cach-nau-lau-ca-bop-mang-chua-cay-ngon-hap-dan-1374344" },
      { name: "Tôm càng xanh rang XO" },
      { name: "Gà hấp cải xanh và xôi", referenceUrl: "https://www.bachhoaxanh.com/kinh-nghiem-hay/cach-lam-ga-hap-cai-thia-thom-ngon-ga-mem-ngot-thit-1264016" },
      { name: "Đĩa trái cây tươi", referenceUrl: "https://www.bachhoaxanh.com/trai-cay-tuoi-ngon" },
      { name: "Chè nhãn nhục", referenceUrl: "https://www.bachhoaxanh.com/kinh-nghiem-hay/cach-nau-che-nhan-nhuc-thom-mat-997836" },
    ],
  },
  {
    code: "BO1_TD4", name: "Thực đơn 4", groupName: "Bộ thực đơn 1", sortOrder: 104,
    dishes: [
      { name: "Há cảo tôm hấp và chạo cá chiên", referenceUrl: "https://www.bachhoaxanh.com/kinh-nghiem-hay/cach-lam-ha-cao-tom-thit-deo-mem-vua-an-1180890" },
      { name: "Miến xào hải sản", referenceUrl: "https://www.bachhoaxanh.com/kinh-nghiem-hay/cach-lam-mien-xao-hai-san-toi-ngon-khong-bi-dinh-1378010" },
      { name: "Bò cuộn phô mai", referenceUrl: "https://www.bachhoaxanh.com/kinh-nghiem-hay/cach-lam-bo-cuon-pho-mai-chien-thom-lung-beo-ngay-ai-cung-me-1419573" },
      { name: "Súp cua", referenceUrl: "https://www.bachhoaxanh.com/kinh-nghiem-hay/bo-tui-ngay-cach-nau-sup-cua-an-sang-nhanh-gon-khong-bi-chay-nuoc-1300089" },
      { name: "Lườn ngỗng áp chảo sốt tiêu" },
      { name: "Rau câu thập cẩm" },
      { name: "Chè đậu xanh", referenceUrl: "https://www.bachhoaxanh.com/kinh-nghiem-hay/cach-nau-che-dau-xanh-pho-tai-thom-ngon-de-lam-1001591" },
    ],
  },
  {
    code: "BO1_TD5", name: "Thực đơn 5", groupName: "Bộ thực đơn 1", sortOrder: 105,
    dishes: [
      { name: "Súp cua nấm tuyết" },
      { name: "Gà nấu lagu và bánh mì", referenceUrl: "https://www.bachhoaxanh.com/kinh-nghiem-hay/doi-mon-voi-lagu-ga-cham-banh-mi-cuc-hap-dan-1139152" },
      { name: "Bò né bánh đa" },
      { name: "Lẩu cá lăng măng chua và bún", referenceUrl: "https://www.bachhoaxanh.com/kinh-nghiem-hay/cuoi-tuan-vao-bep-lam-mon-lau-ca-lang-bong-so-dua-cho-ca-nha-cung-thuong-thuc-1315782" },
      { name: "Cá diêu hồng hấp Hồng Kông", referenceUrl: "https://www.bachhoaxanh.com/kinh-nghiem-hay/cach-lam-ca-dieu-hong-hap-hong-kong-ngon-chuan-vi-nha-hang-1383037" },
      { name: "Chè khúc bạch" },
      { name: "Rau câu trái cây" },
    ],
  },
  {
    code: "BO2_TD1", name: "Thực đơn 1", groupName: "Bộ thực đơn 2", sortOrder: 201,
    dishes: [
      { name: "Gỏi ngó sen tôm thịt và bánh phồng" }, { name: "Súp cua đồng" }, { name: "Gà hấp lá chanh" },
      { name: "Cá rô kho tộ", referenceUrl: "https://www.bachhoaxanh.com/kinh-nghiem-hay/cach-lam-ca-ro-kho-to-khong-bi-tanh-mau-sac-dep-nhin-la-doi-bung-ngay-1199507" },
      { name: "Mực nhồi thịt hấp xì dầu" },
      { name: "Tôm rang me", referenceUrl: "https://www.bachhoaxanh.com/kinh-nghiem-hay/cach-lam-tom-tit-rang-me-chua-ngot-hap-dan-an-la-ghien-ngay-1323400" },
      { name: "Lẩu thập cẩm và bún tươi" },
      { name: "Chè khoai môn", referenceUrl: "https://www.bachhoaxanh.com/kinh-nghiem-hay/cac-cach-nau-che-khoai-mon-thom-ngon-don-gian-tai-nha-1407289" },
    ],
  },
  {
    code: "BO2_TD2", name: "Thực đơn 2", groupName: "Bộ thực đơn 2", sortOrder: 202,
    dishes: [
      { name: "Gỏi bắp bò trộn rau răm", referenceUrl: "https://www.bachhoaxanh.com/kinh-nghiem-hay/lam-mon-goi-bo-rau-ram-thom-ngon-la-mieng-thit-bo-mem-khong-bi-dai-1330350" },
      { name: "Súp bào ngư", referenceUrl: "https://www.bachhoaxanh.com/kinh-nghiem-hay/3-cach-nau-sup-bao-ngu-thom-ngon-bo-duong-cho-gia-dinh-1377616" },
      { name: "Gà luộc nguyên con", referenceUrl: "https://www.bachhoaxanh.com/kinh-nghiem-hay/mach-chi-em-3-cach-luoc-ga-chuan-chi-thit-ga-mem-ngot-lai-khong-bi-rach-da-1283932" },
      { name: "Cá chép om dưa", referenceUrl: "https://www.bachhoaxanh.com/kinh-nghiem-hay/cong-thuc-lam-mon-ca-chep-om-dua-chua-cuc-chuan-cuc-ngon-cua-anh-dat-1225886" },
      { name: "Bò xào lăn", referenceUrl: "https://www.bachhoaxanh.com/kinh-nghiem-hay/cach-lam-mon-bo-xao-lan-don-gian-thom-ngon-het-say-1568354" },
      { name: "Tôm nướng muối ớt", referenceUrl: "https://www.bachhoaxanh.com/kinh-nghiem-hay/tuyet-chieu-giup-mon-tom-nuong-muoi-ot-them-ngon-975586" },
      { name: "Lẩu cua đồng và bún", referenceUrl: "https://www.bachhoaxanh.com/kinh-nghiem-hay/cach-nau-lau-cua-dong-mien-nam-ngon-chuan-vi-cho-bua-tiec-cuoi-tuan-1210128" },
      { name: "Chè đậu xanh" },
    ],
  },
  {
    code: "BO2_TD3", name: "Thực đơn 3", groupName: "Bộ thực đơn 2", sortOrder: 203,
    dishes: [
      { name: "Gỏi ngó sen tôm thịt" }, { name: "Súp vi cá" }, { name: "Gà hấp nấm hương" }, { name: "Cá rô kho tộ" },
      { name: "Bò xào sả ớt", referenceUrl: "https://www.bachhoaxanh.com/kinh-nghiem-hay/cach-lam-bo-xao-sa-ot-cay-nong-ngon-kho-cuong-1209415" },
      { name: "Tôm rang muối", referenceUrl: "https://www.bachhoaxanh.com/kinh-nghiem-hay/3-cach-lam-tom-rang-muoi-ngon-gion-dam-vi-de-lam-tai-nha-1420524" },
      { name: "Lẩu nấm hải sản" }, { name: "Chè khoai môn" },
    ],
  },
  {
    code: "BO2_TD4", name: "Thực đơn 4", groupName: "Bộ thực đơn 2", sortOrder: 204,
    dishes: [{ name: "Gỏi bắp bò" }, { name: "Súp cua" }, { name: "Gà luộc" }, { name: "Cá chép om dưa" }, { name: "Bò xào lăn" }, { name: "Tôm nướng" }, { name: "Lẩu hải sản" }, { name: "Chè đậu xanh" }],
  },
  {
    code: "BO2_TD5", name: "Thực đơn 5", groupName: "Bộ thực đơn 2", sortOrder: 205,
    dishes: [{ name: "Gỏi ngó sen" }, { name: "Súp bào ngư" }, { name: "Gà hấp lá chanh" }, { name: "Cá rô kho tộ" }, { name: "Bò xào sả ớt" }, { name: "Tôm rang muối" }, { name: "Lẩu nấm" }, { name: "Chè khoai môn" }],
  },
  {
    code: "BO3_TD1", name: "Thực đơn 1", groupName: "Bộ thực đơn 3", sortOrder: 301,
    dishes: [
      { name: "Gỏi ngó sen" },
      { name: "Súp hải sản", referenceUrl: "https://www.bachhoaxanh.com/kinh-nghiem-hay/cach-nau-sup-hai-san-thom-ngon-bo-duong-cho-ca-gia-dinh-1234859" },
      { name: "Gà xào sả ớt", referenceUrl: "https://www.bachhoaxanh.com/kinh-nghiem-hay/cach-lam-ga-xao-sa-ot-cay-thom-nong-ngon-mieng-tai-nha-1335523" },
      { name: "Tôm hấp sả", referenceUrl: "https://www.bachhoaxanh.com/kinh-nghiem-hay/cach-lam-tom-hap-sa-thom-nut-mui-thit-ngon-ngot-1211700" },
      { name: "Cá nướng mắm me" },
      { name: "Bò cuốn lá lốt", referenceUrl: "https://www.bachhoaxanh.com/kinh-nghiem-hay/cach-lam-bo-nuong-la-lot-thom-lung-hap-dan-964066" },
      { name: "Lẩu cá lóc chua cay và bún tươi", referenceUrl: "https://www.bachhoaxanh.com/kinh-nghiem-hay/bi-quyet-lam-lau-ca-loc-chua-cay-dam-da-thom-ngon-don-gian-tai-nha-1375183" },
      { name: "Chè bắp", referenceUrl: "https://www.bachhoaxanh.com/kinh-nghiem-hay/cach-lam-che-bap-ngon-tuyet-930195" },
    ],
  },
  {
    code: "BO3_TD2", name: "Thực đơn 2", groupName: "Bộ thực đơn 3", sortOrder: 302,
    dishes: [{ name: "Gỏi bắp bò" }, { name: "Súp cua" }, { name: "Gà quay", referenceUrl: "https://www.bachhoaxanh.com/kinh-nghiem-hay/cach-lam-ga-quay-da-gion-bang-noi-chien-khong-dau-sieu-de-1403052" }, { name: "Cá chẽm sốt Tứ Xuyên" }, { name: "Bò xào sả ớt" }, { name: "Tôm nướng" }, { name: "Lẩu hải sản" }, { name: "Chè đậu xanh" }],
  },
  {
    code: "BO3_TD3", name: "Thực đơn 3", groupName: "Bộ thực đơn 3", sortOrder: 303,
    dishes: [
      { name: "Nộm hoa chuối tai lợn", referenceUrl: "https://www.bachhoaxanh.com/kinh-nghiem-hay/lam-nom-hoa-chuoi-tai-heo-khong-tham-gion-ngon-doi-vi-cho-bua-an-gia-dinh-1372370" },
      { name: "Salad dầu giấm", referenceUrl: "https://www.bachhoaxanh.com/kinh-nghiem-hay/huong-dan-lam-mon-salad-dau-giam-thom-ngon-bo-duong-de-lam-tai-nha-1373466" },
      { name: "Mực hấp hành", referenceUrl: "https://www.bachhoaxanh.com/kinh-nghiem-hay/bo-tui-2-cong-thuc-lam-muc-hap-hanh-thom-lung-cho-bua-com-gia-dinh-1396117" },
      { name: "Tôm hấp tại bàn" }, { name: "Gà xào sả ớt" },
      { name: "Bánh tráng cuốn thịt luộc", referenceUrl: "https://www.bachhoaxanh.com/kinh-nghiem-hay/cach-lam-banh-trang-cuon-thit-heo-ngon-dung-dieu-1371901" },
      { name: "Canh chua cá bớp", referenceUrl: "https://www.bachhoaxanh.com/kinh-nghiem-hay/cach-nau-canh-chua-ca-bop-ngon-khong-bi-tanh-1224064" },
      { name: "Chè hạt sen", referenceUrl: "https://www.bachhoaxanh.com/kinh-nghiem-hay/cach-nau-che-hat-sen-voi-duong-phen-thanh-mat-cuc-don-gian-993654" },
    ],
  },
  {
    code: "BO3_TD4", name: "Thực đơn 4", groupName: "Bộ thực đơn 3", sortOrder: 304,
    dishes: [
      { name: "Gỏi gà", referenceUrl: "https://www.bachhoaxanh.com/kinh-nghiem-hay/tong-hop-9-cach-lam-goi-ga-ngon-nhat-cho-bua-com-gia-dinh-1419478" },
      { name: "Nộm rau câu hải sản" }, { name: "Canh chua cá lóc" },
      { name: "Bò sốt tiêu đen kèm bánh bao", referenceUrl: "https://www.bachhoaxanh.com/kinh-nghiem-hay/cach-lam-mon-thit-bo-sot-tieu-den-mem-ngon-cuc-hao-com-1373426" },
      { name: "Lẩu hải sản" }, { name: "Tôm sú rang muối" }, { name: "Trái cây theo mùa" },
    ],
  },
  {
    code: "BO3_TD5", name: "Thực đơn 5", groupName: "Bộ thực đơn 3", sortOrder: 305,
    dishes: [
      { name: "Nộm hoa chuối", referenceUrl: "https://www.bachhoaxanh.com/kinh-nghiem-hay/cach-lam-nom-hoa-chuoi-da-heo-gion-tan-thom-phuc-de-lam-tai-nha-1379079" },
      { name: "Chân giò hầm đậu đỏ", referenceUrl: "https://www.bachhoaxanh.com/kinh-nghiem-hay/cach-lam-chan-gio-ham-dau-do-beo-bui-tam-bo-cho-ca-nha-1581802" },
      { name: "Cá lóc nướng trui", referenceUrl: "https://www.bachhoaxanh.com/kinh-nghiem-hay/cach-lam-mon-ca-loc-nuong-trui-dan-da-dac-san-mien-tay-1372928" },
      { name: "Tôm cuộn phô mai" },
      { name: "Gà nướng mật ong", referenceUrl: "https://www.bachhoaxanh.com/kinh-nghiem-hay/cach-lam-dui-ga-nuong-mat-ong-thom-lung-ca-gian-bep-tre-nho-va-nguoi-lon-deu-me-1265231" },
      { name: "Canh hải sản" }, { name: "Chè đậu xanh" },
    ],
  },
];

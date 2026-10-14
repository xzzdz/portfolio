import type { L } from "@/lib/i18n";

export type ShopSeed = { shop: L; owner: L };

const s = (shopTh: string, shopEn: string, ownerTh: string, ownerEn: string): ShopSeed => ({
  shop: { th: shopTh, en: shopEn },
  owner: { th: ownerTh, en: ownerEn },
});

/** ร้านค้าตัวอย่างแยกตามโซน — ชื่อทั้งหมดเป็นชื่อสมมุติ */
export const shopsByZone: Record<string, ShopSeed[]> = {
  A: [
    s("ป้าแดงผลไม้สด", "Auntie Daeng Fresh Fruit", "แดง ศรีสุข", "Daeng Srisuk"),
    s("ผักปลอดสารลุงชัย", "Uncle Chai Organic Veg", "ชัย ใจงาม", "Chai Jaingam"),
    s("ลำไยสวนแม่ปิง", "Mae Ping Longan", "ปิยะ บุญมา", "Piya Boonma"),
    s("ส้มสายน้ำผึ้งฝาง", "Fang Honey Oranges", "สมพงษ์ คำแสน", "Sompong Khamsaen"),
    s("ผักพื้นบ้านป้าบัว", "Auntie Bua Local Greens", "บัวผัน แก้วมา", "Buaphan Kaewma"),
    s("มะม่วงเจ๊หน่อย", "Jay Noi Mangoes", "นงลักษณ์ ทองดี", "Nongluck Thongdee"),
    s("เห็ดสดฟาร์มดอย", "Doi Farm Mushrooms", "ธนพล วงศ์ใหญ่", "Thanaphon Wongyai"),
    s("สตรอว์เบอร์รีสะเมิง", "Samoeng Strawberries", "กมล จันทร์เพ็ญ", "Kamol Janpen"),
    s("ผลไม้นำเข้าเฮียต้น", "Hia Ton Imported Fruit", "ต้น แซ่ลี้", "Ton Saelee"),
    s("ผักไฮโดรน้องมิว", "Mew Hydroponics", "มิว พรหมวงศ์", "Mew Promwong"),
    s("กล้วยหอมทองลุงคำ", "Uncle Kham Bananas", "คำ อินทร์แก้ว", "Kham Inkaew"),
    s("พริกกระเทียมแม่จันทร์", "Mae Jan Chili & Garlic", "จันทร์ สุขเจริญ", "Jan Sukcharoen"),
  ],
  B: [
    s("หมูสดเจ๊ศรี", "Jay Sri Fresh Pork", "ศรีวรรณ มณีรัตน์", "Sriwan Maneerat"),
    s("ไก่สดฟาร์มพี่โต้ง", "P'Tong Farm Chicken", "ต้อง ศักดิ์ดี", "Tong Sakdee"),
    s("ปลาสดสมพร", "Somporn Fresh Fish", "สมพร ทะเลงาม", "Somporn Talengam"),
    s("กุ้งแม่น้ำบ้านเรา", "Baan Rao River Prawns", "ประเสริฐ น้ำใส", "Prasert Namsai"),
    s("เนื้อโคขุนพี่บอย", "P'Boy Premium Beef", "บอย ทรัพย์มาก", "Boy Sapmak"),
    s("ไข่สดฟาร์มสุนทร", "Sunthorn Farm Eggs", "สุนทร ไชยวงศ์", "Sunthorn Chaiwong"),
    s("ทะเลแห้งป้าเล็ก", "Auntie Lek Dried Seafood", "เล็ก ชลธาร", "Lek Chonlathan"),
    s("ลูกชิ้นปลาเจ๊ฮวย", "Jay Huay Fish Balls", "ฮวย แซ่ตั้ง", "Huay Saetang"),
    s("หมูยอแม่ทองใบ", "Mae Thongbai Pork Roll", "ทองใบ มีสุข", "Thongbai Meesuk"),
  ],
  C: [
    s("ข้าวซอยลุงหนุ่ม", "Uncle Num Khao Soi", "หนุ่ม กาวิละ", "Num Kawila"),
    s("ไส้อั่วแม่คำปัน", "Mae Kampan Sai Ua", "คำปัน ปัญญา", "Kampan Panya"),
    s("น้ำพริกหนุ่มแม่บัวคำ", "Mae Buakham Chili Dip", "บัวคำ ธรรมใจ", "Buakham Thamjai"),
    s("หมูปิ้งพี่ต่าย", "P'Tai Grilled Pork", "ต่าย รุ่งเรือง", "Tai Rungruang"),
    s("ข้าวมันไก่เฮียเม้ง", "Hia Meng Chicken Rice", "เม้ง แซ่โค้ว", "Meng Saekhow"),
    s("ส้มตำน้องแพร", "Nong Prae Som Tam", "แพรวา ศรีบุญ", "Praewa Sriboon"),
    s("กาแฟดอยดี", "Doi Dee Coffee", "ดาวเรือง ดอยคำ", "Daoruang Doikham"),
    s("ชาไทยน้องฝน", "Nong Fon Thai Tea", "ฝน พิมพ์ใจ", "Fon Pimjai"),
    s("ขนมจีนน้ำเงี้ยวป้าศรี", "Auntie Sri Nam Ngiao", "ศรีนวล ใจบุญ", "Srinuan Jaiboon"),
    s("โรตีบังมานพ", "Bang Manop Roti", "มานพ ยูโซะ", "Manop Yuso"),
    s("ขนมครกยายเพลิน", "Grandma Ploen Kanom Krok", "เพลิน สุขสม", "Ploen Suksom"),
    s("แคบหมูลุงจอม", "Uncle Jom Pork Rinds", "จอม ตาคำ", "Jom Takham"),
  ],
  D: [
    s("เสื้อผ้ามือสองบุษบา", "Busaba Vintage Wear", "บุษบา สายสุวรรณ", "Busaba Saisuwan"),
    s("ผ้าทอมือดอยเต่า", "Doi Tao Handwoven", "ทองสุข แสนคำ", "Thongsuk Saenkham"),
    s("ร่มบ่อสร้างลุงแก้ว", "Uncle Kaew Umbrellas", "แก้ว บุญเรือง", "Kaew Boonruang"),
    s("รองเท้าเจ๊เพ็ญ", "Jay Pen Footwear", "เพ็ญศรี ทองคำ", "Pensri Thongkham"),
    s("ของฝากล้านนา", "Lanna Souvenirs", "อนันต์ ศรีวิชัย", "Anan Sriwichai"),
    s("เคสมือถือน้องเจ", "Nong J Phone Cases", "เจษฎา ใจเย็น", "Jetsada Jaiyen"),
    s("จักสานป้าทอง", "Auntie Thong Basketry", "ทองม้วน มะลิวัลย์", "Thongmuan Maliwan"),
    s("เครื่องเงินวัวลาย", "Wua Lai Silverware", "สุริยา เงินงาม", "Suriya Ngoenngam"),
    s("กระเป๋าผ้าคราม", "Indigo Tote Bags", "ครามทิพย์ ฟ้าใส", "Kramthip Fasai"),
  ],
  E: [
    s("ดอกไม้สดน้องแนน", "Nong Nan Flowers", "แนน บานเย็น", "Nan Banyen"),
    s("ต้นไม้มงคลพี่เอก", "P'Ek Lucky Plants", "เอกชัย เขียวขจี", "Ekkachai Khiewkhajee"),
    s("ไอศกรีมกะทิสด", "Coconut Ice Cream", "สมใจ หวานเย็น", "Somjai Wanyen"),
    s("น้ำปั่นเฟรชชี่", "Freshy Smoothies", "ณัฐ ปั่นดี", "Nat Pandee"),
    s("ของเล่นลุงหวัง", "Uncle Wang Toys", "หวัง แซ่ลิ้ม", "Wang Saelim"),
  ],
};

/** ลูกค้าที่อยู่ระหว่างเสนอราคา (ยังไม่เป็นผู้เช่า) */
export const prospects: ShopSeed[] = [
  s("ชานมไข่มุกบับเบิ้ลดี", "Bubble Dee Milk Tea", "พิมพ์ชนก ใจสว่าง", "Pimchanok Jaisawang"),
  s("ขนมไทยแม่มาลี", "Mae Malee Thai Desserts", "มาลี ศรีทอง", "Malee Srithong"),
  s("ร้านเครื่องเทศเชฟโอ", "Chef O Spices", "โอฬาร ปรุงดี", "Olan Prungdee"),
  s("ไก่ทอดหาดใหญ่พี่เมย์", "P'May Hat Yai Fried Chicken", "เมษา หอมกรุ่น", "Mesa Homkrun"),
  s("ผ้าไหมบ้านครัว", "Baan Krua Silk", "สมศักดิ์ ไหมทอง", "Somsak Maithong"),
];

export const staffNames = [
  { name: { th: "มะลิ วงศ์คำ", en: "Mali Wongkham" }, role: { th: "แอดมินสาขา", en: "Branch admin" }, email: "mali@sukjai.demo" },
  { name: { th: "ปกรณ์ ใจดี", en: "Pakorn Jaidee" }, role: { th: "การเงิน/บัญชี", en: "Finance" }, email: "pakorn@sukjai.demo" },
  { name: { th: "ธีรวัฒน์ ทองมา", en: "Teerawat Thongma" }, role: { th: "พนักงานเก็บเงิน (Handheld)", en: "Collector (Handheld)" }, email: "teerawat@sukjai.demo" },
  { name: { th: "อรุณี แสงทอง", en: "Arunee Saengthong" }, role: { th: "ผู้จัดการตลาด", en: "Market manager" }, email: "arunee@sukjai.demo" },
];

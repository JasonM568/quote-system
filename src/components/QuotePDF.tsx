import { Document, Page, Text, View, StyleSheet, Image, Font } from "@react-pdf/renderer";

Font.register({
  family: "NotoSansTC",
  fonts: [
    { src: "https://fonts.gstatic.com/s/notosanstc/v36/-nFuOG829Oofr2wohFbTp9ifNAn722rq0MXz76Cy_CpOtma3uNQ.ttf", fontWeight: 400 },
    { src: "https://fonts.gstatic.com/s/notosanstc/v36/-nFuOG829Oofr2wohFbTp9ifNAn722rq0MXz7_iy_CpOtma3uNQ.ttf", fontWeight: 700 },
  ],
});

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "NotoSansTC", fontSize: 10, color: "#1e293b" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 30, alignItems: "flex-start" },
  logo: { width: 120, height: 60, objectFit: "contain" },
  companyInfo: { textAlign: "right", fontSize: 8, color: "#64748b", lineHeight: 1.6 },
  title: { fontSize: 22, fontWeight: 700, textAlign: "center", marginBottom: 20, color: "#1e3a5f" },
  infoRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  infoBox: { width: "48%", padding: 10, backgroundColor: "#f8fafc", borderRadius: 4 },
  infoLabel: { fontSize: 9, fontWeight: 700, color: "#64748b", marginBottom: 6, textTransform: "uppercase" },
  infoText: { fontSize: 9, lineHeight: 1.6 },
  table: { marginTop: 10 },
  tableHeader: { flexDirection: "row", backgroundColor: "#1e3a5f", padding: 8, borderRadius: 4 },
  tableHeaderCell: { color: "#ffffff", fontSize: 9, fontWeight: 700 },
  tableRow: { flexDirection: "row", padding: 8, borderBottomWidth: 1, borderBottomColor: "#e2e8f0" },
  tableCell: { fontSize: 9 },
  col1: { width: "5%" },
  col2: { width: "30%" },
  col3: { width: "20%" },
  col4: { width: "15%", textAlign: "right" },
  col5: { width: "10%", textAlign: "right" },
  col6: { width: "20%", textAlign: "right" },
  summary: { marginTop: 15, alignItems: "flex-end", paddingRight: 10 },
  summaryRow: { flexDirection: "row", justifyContent: "flex-end", marginBottom: 4, width: 250 },
  summaryLabel: { width: 120, textAlign: "right", fontSize: 9, color: "#64748b", paddingRight: 10 },
  summaryValue: { width: 130, textAlign: "right", fontSize: 9 },
  totalRow: { flexDirection: "row", justifyContent: "flex-end", marginTop: 6, paddingTop: 6, borderTopWidth: 2, borderTopColor: "#1e3a5f", width: 250 },
  totalLabel: { width: 120, textAlign: "right", fontSize: 12, fontWeight: 700, color: "#1e3a5f", paddingRight: 10 },
  totalValue: { width: 130, textAlign: "right", fontSize: 12, fontWeight: 700, color: "#1e3a5f" },
  footer: { position: "absolute", bottom: 40, left: 40, right: 40 },
  footerContent: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", borderTopWidth: 1, borderTopColor: "#e2e8f0", paddingTop: 15 },
  stamp: { width: 80, height: 80, objectFit: "contain" },
  notes: { marginTop: 20, padding: 10, backgroundColor: "#fffbeb", borderRadius: 4 },
  notesLabel: { fontSize: 9, fontWeight: 700, color: "#92400e", marginBottom: 4 },
  notesText: { fontSize: 9, color: "#78350f", lineHeight: 1.5 },
  validDate: { fontSize: 8, color: "#64748b", marginTop: 10, textAlign: "center" },
});

interface QuotePDFProps {
  quote: {
    quoteNumber: string;
    createdAt: string;
    validUntil: string;
    discount: string;
    taxRate: string;
    subtotal: string;
    taxAmount: string;
    totalAmount: string;
    notes: string | null;
    status: string;
  };
  customer: {
    companyName: string;
    taxId: string | null;
    contactPerson: string;
    address: string | null;
    email: string;
    phone: string | null;
  };
  company: {
    name: string;
    address: string;
    phone: string;
    email: string;
    taxId: string;
  };
  items: {
    name: string;
    specification: string | null;
    unitPrice: string;
    quantity: number;
    amount: string;
  }[];
  userName: string;
  logoBase64: string | null;
  stampBase64: string | null;
}

export function QuotePDF({ quote, customer, company, items, userName, logoBase64, stampBase64 }: QuotePDFProps) {
  const formatDate = (d: string) => new Date(d).toLocaleDateString("zh-TW", { year: "numeric", month: "2-digit", day: "2-digit" });
  const formatMoney = (v: string) => `NT$ ${Number(v).toLocaleString()}`;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header with Logo */}
        <View style={styles.header}>
          <View>
            {logoBase64 && <Image src={logoBase64} style={styles.logo} />}
            <Text style={{ fontSize: 14, fontWeight: 700, marginTop: 5 }}>{company.name}</Text>
          </View>
          <View style={styles.companyInfo}>
            {company.taxId && <Text>統一編號：{company.taxId}</Text>}
            {company.address && <Text>{company.address}</Text>}
            {company.phone && <Text>電話：{company.phone}</Text>}
            {company.email && <Text>{company.email}</Text>}
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>報 價 單</Text>

        {/* Quote & Customer Info */}
        <View style={styles.infoRow}>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>客戶資訊</Text>
            <Text style={styles.infoText}>{customer.companyName}</Text>
            {customer.taxId && <Text style={styles.infoText}>統編：{customer.taxId}</Text>}
            <Text style={styles.infoText}>聯絡人：{customer.contactPerson}</Text>
            <Text style={styles.infoText}>{customer.email}</Text>
            {customer.address && <Text style={styles.infoText}>{customer.address}</Text>}
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>報價資訊</Text>
            <Text style={styles.infoText}>報價單號：{quote.quoteNumber}</Text>
            <Text style={styles.infoText}>報價日期：{formatDate(quote.createdAt)}</Text>
            <Text style={styles.infoText}>有效日期：{formatDate(quote.validUntil)}</Text>
            <Text style={styles.infoText}>報價人員：{userName}</Text>
          </View>
        </View>

        {/* Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.col1]}>#</Text>
            <Text style={[styles.tableHeaderCell, styles.col2]}>項目名稱</Text>
            <Text style={[styles.tableHeaderCell, styles.col3]}>規格</Text>
            <Text style={[styles.tableHeaderCell, styles.col4]}>單價</Text>
            <Text style={[styles.tableHeaderCell, styles.col5]}>數量</Text>
            <Text style={[styles.tableHeaderCell, styles.col6]}>金額</Text>
          </View>
          {items.map((item, i) => (
            <View key={i} style={[styles.tableRow, i % 2 === 1 ? { backgroundColor: "#f8fafc" } : {}]}>
              <Text style={[styles.tableCell, styles.col1]}>{i + 1}</Text>
              <Text style={[styles.tableCell, styles.col2]}>{item.name}</Text>
              <Text style={[styles.tableCell, styles.col3]}>{item.specification || "-"}</Text>
              <Text style={[styles.tableCell, styles.col4]}>{formatMoney(item.unitPrice)}</Text>
              <Text style={[styles.tableCell, styles.col5]}>{item.quantity}</Text>
              <Text style={[styles.tableCell, styles.col6]}>{formatMoney(item.amount)}</Text>
            </View>
          ))}
        </View>

        {/* Summary */}
        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>小計</Text>
            <Text style={styles.summaryValue}>{formatMoney(quote.subtotal)}</Text>
          </View>
          {Number(quote.discount) > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>折扣 ({quote.discount}%)</Text>
              <Text style={styles.summaryValue}>-{formatMoney(String(Number(quote.subtotal) * Number(quote.discount) / 100))}</Text>
            </View>
          )}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>稅額 ({quote.taxRate}%)</Text>
            <Text style={styles.summaryValue}>{formatMoney(quote.taxAmount)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>合計</Text>
            <Text style={styles.totalValue}>{formatMoney(quote.totalAmount)}</Text>
          </View>
        </View>

        {/* Notes */}
        {quote.notes && (
          <View style={styles.notes}>
            <Text style={styles.notesLabel}>備註：</Text>
            <Text style={styles.notesText}>{quote.notes}</Text>
          </View>
        )}

        <Text style={styles.validDate}>本報價單有效期限至 {formatDate(quote.validUntil)}</Text>

        {/* Footer with Stamp */}
        <View style={styles.footer}>
          <View style={styles.footerContent}>
            <Text style={{ fontSize: 8, color: "#94a3b8" }}>{company.name} | {quote.quoteNumber}</Text>
            {stampBase64 && <Image src={stampBase64} style={styles.stamp} />}
          </View>
        </View>
      </Page>
    </Document>
  );
}

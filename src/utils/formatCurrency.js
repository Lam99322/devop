export default function formatCurrency(amount) {
  if (!amount && amount !== 0) return "0 ₫";
  return amount.toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });
}

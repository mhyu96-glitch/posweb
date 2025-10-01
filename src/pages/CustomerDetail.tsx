import { useParams } from "react-router-dom";

const CustomerDetail = () => {
  const { phone } = useParams();
  return (
    <div className="container mx-auto p-4 md:p-6">
      <h1 className="text-3xl font-bold mb-4">Detail Pelanggan</h1>
      <p>Menampilkan detail untuk pelanggan dengan nomor HP: {phone}</p>
      <p>Fitur ini akan segera tersedia.</p>
    </div>
  );
};

export default CustomerDetail;
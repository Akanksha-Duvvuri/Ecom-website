import Image from "next/image";

type Item = {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
};

async function getProduct(id: string): Promise<Item> {
  const res = await fetch(`http://localhost:5000/items/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch product");
  }

  return res.json();
}

export default async function ProductPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await getProduct(params.id);

  return (
    <div style={{ padding: "60px 40px" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "40px",
        }}
      >
        {/* Image */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "400px",
          }}
        >
          <Image
            src={`/${product.image}`}
            alt={product.name}
            fill
            style={{ objectFit: "cover", borderRadius: "12px" }}
          />
        </div>

        {/* Info */}
        <div>
          <h1 style={{ fontSize: "32px", marginBottom: "20px" }}>
            {product.name}
          </h1>

          <p style={{ fontSize: "22px", fontWeight: "bold", marginBottom: "20px" }}>
            ${product.price}
          </p>

          <p style={{ color: "#555", marginBottom: "30px" }}>
            {product.description}
          </p>

          <button
            style={{
              padding: "12px 24px",
              backgroundColor: "black",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
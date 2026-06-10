import { ArrowLeft, Search, ShoppingBag, Star, Truck } from "lucide-react";
import { Button, Card, Chip, Typography } from "@heroui/react";
import { useEffect, useMemo, useState } from "react";

import { products } from "./products.js";

const formatPrice = (price) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);

function getProductFromHash() {
  const match = window.location.hash.match(/^#\/product\/(.+)$/);
  return match ? decodeURIComponent(match[1]) : null;
}

function App() {
  const [selectedProductId, setSelectedProductId] = useState(getProductFromHash);
  const selectedProduct = products.find((product) => product.id === selectedProductId);
  const featuredProduct = products[0];

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(products.map((product) => product.category)))],
    [],
  );

  useEffect(() => {
    const handleHashChange = () => setSelectedProductId(getProductFromHash());

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  if (selectedProduct) {
    return <ProductDetail product={selectedProduct} />;
  }

  return (
    <main className="min-h-screen">
      <Header />

      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
          <section className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-black/5">
            <div className="grid min-h-[360px] md:grid-cols-[0.95fr_1.05fr]">
              <div className="flex flex-col justify-between gap-8 p-6 sm:p-8">
                <div className="flex flex-col gap-4">
                  <Chip color="accent" variant="soft">
                    Spring edit
                  </Chip>
                  <div className="max-w-xl">
                    <Typography className="text-4xl sm:text-5xl" type="h1">
                      Everyday products, selected for real use.
                    </Typography>
                  </div>
                  <Typography className="max-w-lg text-slate-600" type="body">
                    Shop durable gear, home essentials, tech, and style pieces in one responsive
                    catalog.
                  </Typography>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    className="w-full sm:w-auto"
                    onPress={() => document.getElementById("products")?.scrollIntoView()}
                  >
                    Browse products
                  </Button>
                  <Button className="w-full sm:w-auto" variant="outline">
                    <Truck className="size-4" />
                    Free shipping over $75
                  </Button>
                </div>
              </div>
              <a
                aria-label={`View ${featuredProduct.name}`}
                className="relative block min-h-[260px] overflow-hidden bg-slate-100"
                href={`#/product/${featuredProduct.id}`}
              >
                <img
                  alt={featuredProduct.name}
                  className="absolute inset-0 h-full w-full object-cover"
                  src={featuredProduct.image}
                />
                <div className="absolute inset-x-4 bottom-4 rounded-lg bg-white/92 p-4 shadow-lg backdrop-blur">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-500">Featured</p>
                      <p className="text-lg font-semibold text-slate-950">{featuredProduct.name}</p>
                    </div>
                    <p className="text-lg font-semibold text-slate-950">
                      {formatPrice(featuredProduct.price)}
                    </p>
                  </div>
                </div>
              </a>
            </div>
          </section>

          <aside className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
            <Metric label="Products" value="30" />
            <Metric label="Categories" value={String(categories.length - 1)} />
          </aside>
        </div>

        <section className="flex flex-col gap-5" id="products">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <Typography type="h2">Shop the collection</Typography>
              <Typography color="muted" type="body-sm">
                Click any card to open a full product information page.
              </Typography>
            </div>
            <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
              {categories.map((category) => (
                <Chip key={category} variant={category === "All" ? "primary" : "secondary"}>
                  {category}
                </Chip>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <a className="flex items-center gap-2 text-slate-950" href="#">
          <span className="grid size-9 place-items-center rounded-lg bg-slate-950 text-white">
            <ShoppingBag className="size-5" />
          </span>
          <span className="text-lg font-semibold">Luma Market</span>
        </a>
        <div className="hidden min-w-0 flex-1 justify-center md:flex">
          <div className="flex w-full max-w-md items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">
            <Search className="size-4 shrink-0" />
            <span className="truncate">Search products, categories, and deals</span>
          </div>
        </div>
        <Button size="sm" variant="outline">
          Cart
        </Button>
      </div>
    </header>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-black/5">
      <Typography color="muted" type="body-sm">
        {label}
      </Typography>
      <p className="mt-2 text-4xl font-semibold text-slate-950">{value}</p>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        Curated across daily essentials, home, office, outdoor, beauty, and tech.
      </p>
    </div>
  );
}

function ProductCard({ product }) {
  return (
    <a
      aria-label={`Open ${product.name} details`}
      className="group block rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
      href={`#/product/${product.id}`}
    >
      <Card className="h-full overflow-hidden p-0 transition duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md">
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
          <img
            alt={product.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            loading="lazy"
            src={product.image}
          />
          <Chip className="absolute left-3 top-3 bg-white/90" size="sm" variant="secondary">
            {product.badge}
          </Chip>
        </div>
        <Card.Header className="gap-1 px-4 pt-4">
          <div className="flex w-full items-start justify-between gap-3">
            <div className="min-w-0">
              <Card.Title className="truncate text-base">{product.name}</Card.Title>
              <Card.Description>{product.category}</Card.Description>
            </div>
            <span className="shrink-0 text-base font-semibold text-slate-950">
              {formatPrice(product.price)}
            </span>
          </div>
        </Card.Header>
        <Card.Footer className="mt-auto flex items-center justify-between px-4 pb-4">
          <span className="flex items-center gap-1 text-sm text-slate-700">
            <Star className="size-4 fill-amber-400 text-amber-400" />
            {product.rating}
          </span>
          <span className="text-sm text-slate-500">{product.reviews.toLocaleString()} reviews</span>
        </Card.Footer>
      </Card>
    </a>
  );
}

function ProductDetail({ product }) {
  const relatedProducts = products
    .filter((item) => item.category === product.category && item.id !== product.id)
    .slice(0, 4);

  return (
    <main className="min-h-screen bg-[#f7f8fb]">
      <Header />
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <Button className="w-fit" onPress={() => (window.location.hash = "")} variant="ghost">
          <ArrowLeft className="size-4" />
          Back to products
        </Button>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-black/5">
            <div className="aspect-[4/3] bg-slate-100 lg:aspect-[5/4]">
              <img alt={product.name} className="h-full w-full object-cover" src={product.image} />
            </div>
          </div>

          <section className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <Chip color="accent" variant="soft">
                {product.category}
              </Chip>
              <Chip variant="secondary">{product.badge}</Chip>
            </div>

            <div className="mt-5 flex flex-col gap-3">
              <Typography className="text-3xl sm:text-4xl" type="h1">
                {product.name}
              </Typography>
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                <span className="flex items-center gap-1">
                  <Star className="size-4 fill-amber-400 text-amber-400" />
                  {product.rating} rating
                </span>
                <span>{product.reviews.toLocaleString()} customer reviews</span>
              </div>
              <p className="text-3xl font-semibold text-slate-950">{formatPrice(product.price)}</p>
              <Typography className="max-w-xl text-slate-600" type="body">
                {product.description}
              </Typography>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <Button fullWidth>Add to cart</Button>
              <Button fullWidth variant="outline">
                Save for later
              </Button>
            </div>

            <div className="mt-8 grid gap-3 border-t border-slate-200 pt-6 text-sm text-slate-600 sm:grid-cols-3">
              <Info label="Delivery" value="2-4 days" />
              <Info label="Returns" value="30 days" />
              <Info label="Warranty" value="1 year" />
            </div>
          </section>
        </div>

        {relatedProducts.length > 0 && (
          <section className="flex flex-col gap-4">
            <Typography type="h3">More in {product.category}</Typography>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </section>
        )}
      </section>
    </main>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="font-medium text-slate-950">{label}</p>
      <p>{value}</p>
    </div>
  );
}

export default App;

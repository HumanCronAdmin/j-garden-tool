(() => {
  let products = [];
  const CATEGORY_LABEL = {
    "pruning-shears": "Pruning Shears", "bonsai-tool": "Bonsai Tool",
    "hand-tool": "Hand Tool", saw: "Saw", rake: "Rake",
    watering: "Watering", soil: "Soil", pot: "Pot"
  };
  const BRAND_LABEL = {
    okatsune: "Okatsune", niwaki: "Niwaki", chikamasa: "Chikamasa",
    kaneshin: "Kaneshin", masakuni: "Masakuni", tobisho: "Tobisho",
    ars: "ARS", nishigaki: "Nishigaki", haws: "Haws", other: "Other"
  };
  const STEEL_LABEL = {
    "carbon-steel": "Carbon Steel", "stainless-steel": "Stainless Steel",
    "high-carbon": "High-Carbon", "sk-5": "SK-5", "white-steel": "White Steel",
    "blue-steel": "Blue Steel", ceramic: "Ceramic", "n/a": "N/A"
  };

  const $ = id => document.getElementById(id);

  function populateFilters() {
    const cats = [...new Set(products.map(p => p.category))].sort();
    const brands = [...new Set(products.map(p => p.brand))].sort();
    const steels = [...new Set(products.map(p => p.steel))].sort();

    cats.forEach(c => $("category").innerHTML += `<option value="${c}">${CATEGORY_LABEL[c] || c}</option>`);
    brands.forEach(b => $("brand").innerHTML += `<option value="${b}">${BRAND_LABEL[b] || b}</option>`);
    steels.forEach(s => $("steel").innerHTML += `<option value="${s}">${STEEL_LABEL[s] || s}</option>`);
  }

  function getFiltered() {
    const q = $("search").value.toLowerCase();
    const cat = $("category").value;
    const br = $("brand").value;
    const st = $("steel").value;
    const sort = $("sort").value;

    let list = products.filter(p => {
      if (cat && p.category !== cat) return false;
      if (br && p.brand !== br) return false;
      if (st && p.steel !== st) return false;
      if (q && !p.name.toLowerCase().includes(q) && !p.brand.toLowerCase().includes(q)) return false;
      return true;
    });

    if (sort === "price-asc") list.sort((a, b) => a.price_usd - b.price_usd);
    else if (sort === "price-desc") list.sort((a, b) => b.price_usd - a.price_usd);
    else if (sort === "name-asc") list.sort((a, b) => a.name.localeCompare(b.name));

    return list;
  }

  function renderCard(p) {
    const prosHtml = (p.pros || []).map(pr => `<li>${pr}</li>`).join("");
    const expertHtml = p.expert_note ? `<div class="expert-note">${p.expert_note}</div>` : "";
    const specs = [];
    if (p.blade_length_mm) specs.push(`Blade: ${p.blade_length_mm}mm`);
    if (p.total_length_mm) specs.push(`Length: ${p.total_length_mm}mm`);
    if (p.weight_g) specs.push(`${p.weight_g}g`);
    if (p.made_in) specs.push(`\uD83C\uDDEF\uD83C\uDDF5 ${p.made_in}`);
    const linkHtml = p.amazon_url ? `<div class="product-link"><a href="${p.amazon_url}" target="_blank" rel="noopener noreferrer nofollow">Search on Amazon</a></div>` : "";

    return `<div class="product-card">
      <div class="brand-label">${BRAND_LABEL[p.brand] || p.brand}</div>
      <h3>${p.name}</h3>
      <div class="badges">
        <span class="badge badge-cat">${CATEGORY_LABEL[p.category] || p.category}</span>
        <span class="badge badge-steel">${STEEL_LABEL[p.steel] || p.steel}</span>
      </div>
      <div class="product-meta">${specs.map(s => `<span>${s}</span>`).join("")}</div>
      <div class="product-price">$${p.price_usd.toFixed(2)}</div>
      <ul class="product-pros">${prosHtml}</ul>
      <div class="product-best"><strong>Best for:</strong> ${p.best_for}</div>
      ${expertHtml}
      ${linkHtml}
    </div>`;
  }

  function render() {
    const list = getFiltered();
    $("resultCount").textContent = `${list.length} tool${list.length !== 1 ? "s" : ""} found`;
    $("grid").innerHTML = list.map(renderCard).join("");
  }

  function init() {
    fetch("data/products.json")
      .then(r => r.json())
      .then(data => {
        products = data;
        populateFilters();
        render();
      })
      .catch(err => {
        $("grid").innerHTML = `<p style="padding:24px;color:#5D7A5D">Could not load products. ${err.message}</p>`;
      });

    ["search", "category", "brand", "steel", "sort"].forEach(id => {
      $(id).addEventListener(id === "search" ? "input" : "change", render);
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();

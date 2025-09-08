const API = "http://127.0.0.1:8787";

async function uploadPhoto(file) {
  const key = `cars/${file.name}`;
  const res = await fetch(API + `/${key}`, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  const data = await res.json();
  return data.path;
}

document.getElementById("addCarForm").onsubmit = async (e) => {
  e.preventDefault();

  const file = document.getElementById("carFile").files[0];
  if (!file) {
    return alert("Debes seleccionar una foto antes de añadir el coche.");
  }

  let photoUrl = "";
  try {
    photoUrl = await uploadPhoto(file);
  } catch (err) {
    return alert("Error subiendo la foto: " + err.message);
  }

  const body = {
    car_id: document.getElementById("car_id").value,
    car_name: document.getElementById("car_name").value,
    car_color: document.getElementById("car_color").value,
    car_photo: photoUrl,
    car_treasure: document.getElementById("car_treasure").checked ? "1" : "0",
  };

  try {
    const res = await fetch(API + "/postNewCar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    alert(await res.text());
  } catch (err) {
    alert("Error añadiendo el coche: " + err.message);
  }
};

async function getAllCars() {
  try {
    const res = await fetch(API + "/getAllCars");
    const cars = await res.json();

    const carsList = document.getElementById("carsList");
    carsList.innerHTML = "";

    cars.forEach((car) => {
      const card = document.createElement("div");
      card.className =
        "car-card" + (car.car_treasure === "1" ? " treasure" : "");

      const img = document.createElement("img");
      img.src =
        car.car_photo || "https://via.placeholder.com/100x60?text=Sin+Foto";
      img.alt = car.car_name;

      const info = document.createElement("div");
      info.innerHTML = `
        <strong>${car.car_id} - ${car.car_name}</strong><br>
        Color: ${car.car_color}<br>
        ${car.car_treasure === "1" ? "🔥 Treasure Hunt" : ""}
      `;

      card.appendChild(img);
      card.appendChild(info);
      carsList.appendChild(card);
    });
  } catch (err) {
    alert("Error obteniendo coches: " + err.message);
  }
}

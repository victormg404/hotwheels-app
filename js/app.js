const API = "https://hotwheels-api.victor-sql.workers.dev";

async function uploadPhoto(file, carId) {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const key = `cars/${carId}_${today}_${file.name}`;
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

  const carId = document.getElementById("car_id").value.trim();
  const isTreasure = document.getElementById("car_treasure").checked
    ? "1"
    : "0";

  const file = document.getElementById("carFile").files[0];

  try {
    const res = await fetch(
      API + `/getCarById?id=${encodeURIComponent(carId)}`
    );

    if (res.ok) {
      const existingCar = await res.json();
      if (isTreasure === existingCar.car_treasure) {
        return alert(`Ya existe un coche con ID ${carId}`);
      }
    } else if (res.status !== 404) {
      return alert("Error comprobando si el coche existe.");
    }
  } catch (err) {
    return alert("Error comprobando si el coche existe: " + err.message);
  }

  if (!file) {
    return alert("Debes seleccionar una foto antes de añadir el coche.");
  }

  let photoUrl = "";
  try {
    photoUrl = await uploadPhoto(file, carId);
  } catch (err) {
    return alert("Error subiendo la foto: " + err.message);
  }

  const body = {
    car_id: carId,
    car_name: document.getElementById("car_name").value,
    car_color: document.getElementById("car_color").value,
    car_photo: photoUrl,
    car_treasure: isTreasure,
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

      if (car.car_photo) {
        img.src = `${API}/getCarPhoto?url=${encodeURIComponent(car.car_photo)}`;
      } else {
        img.src = "https://via.placeholder.com/100x60?text=Sin+Foto";
      }

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

async function getCarById() {
  const carId = document.getElementById("searchCarId").value.trim();
  if (!carId) {
    return alert("Debes introducir un ID de coche.");
  }

  try {
    const res = await fetch(
      API + `/getCarById?id=${encodeURIComponent(carId)}`
    );
    if (!res.ok) {
      if (res.status === 404) {
        return alert(`No se encontró ningún coche con ID ${carId}`);
      }
      return alert("Error buscando el coche.");
    }

    const car = await res.json();

    const carsList = document.getElementById("carsList");
    carsList.innerHTML = "";

    const card = document.createElement("div");
    card.className = "car-card" + (car.car_treasure === "1" ? " treasure" : "");

    const img = document.createElement("img");
    if (car.car_photo) {
      img.src = `${API}/getCarPhoto?url=${encodeURIComponent(car.car_photo)}`;
    } else {
      img.src = "https://via.placeholder.com/100x60?text=Sin+Foto";
    }
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
  } catch (err) {
    alert("Error buscando el coche: " + err.message);
  }
}

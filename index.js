import JsonViewer from "./jsonViewer.js";

let requestCache = {};

async function apiFetch(url) {
  document.getElementById("requestUrl").innerText = url;
  document.getElementById("requestUrl").href = url;

  let json;

  if (requestCache[url]) json = requestCache[url];
  else {
    const response = await fetch(url);
    json = await response.json();
    requestCache[url] = json;
  }

  document.getElementById("response").innerHTML = "";
  new JsonViewer({
    container: document.getElementById("response"),
    data: JSON.stringify(json, null, 2),
    theme: "light",
    expand: true,
  });

  return json;
}

async function createLineChart(dataset) {
  await loadGoogleCharts();
  const data = new google.visualization.DataTable();

  data.addColumn("datetime", "Date");
  data.addColumn("number", "New Cases");
  data.addColumn("number", "Deaths");
  data.addColumn("number", "Recovered");

  Object.keys(dataset.cases)
    .filter((_, index) => index % 3 === 0)
    .forEach((date) => {
      data.addRows([
        [
          new Date(date),
          dataset.cases[date],
          dataset.deaths[date],
          dataset.recovered[date],
        ],
      ]);
    });

  const options = {
    curveType: "function",
    legend: { position: "bottom" },
    height: document.body.clientWidth < 768 ? 150 : 400,
  };

  const chart = new google.charts.Line(document.getElementById("chart"));

  chart.draw(data, options);
}

async function createBarChart(dataset, name) {
  await loadGoogleCharts();
  const data = new google.visualization.DataTable();

  data.addColumn("string", "Type");
  data.addColumn("number", name);

  function addKey(key, title) {
    data.addRows([[title, dataset[key]]]);
  }

  addKey("cases", "Cases");
  addKey("deaths", "Deaths");
  addKey("recovered", "Recovered");

  const options = {
    height: document.body.clientWidth < 768 ? 150 : 400,
    pieHole: 0.4,
  };

  const chart = new google.visualization.PieChart(
    document.getElementById("chart")
  );

  chart.draw(data, options);
}

async function createGeoChart(dataset) {
  await loadGoogleCharts();
  const data = new google.visualization.DataTable();

  data.addColumn("string", "Country");
  data.addColumn("number", "Vaccines rolled out");

  data.addRows(
    dataset.map((x) => [
      x.country.replace("USA", "United States").replace("UK", "United Kingdom"),
      Object.values(x.timeline)[0],
    ])
  );

  const chart = new google.visualization.GeoChart(
    document.getElementById("chart")
  );

  chart.draw(data);
}

function focusTab(name) {
  const tabs = document.getElementsByClassName("tabs")[0].children[0].children;
  for (let i = 0; i < tabs.length; i++) {
    tabs[i].classList.remove("is-active");
  }
  document.getElementById(name).parentElement.classList.add("is-active");
}

async function exampleHistory() {
  focusTab("exampleHistory");
  apiFetch("https://disease.sh/v3/covid-19/historical/all?lastdays=all");
  createLineChart(
    await apiFetch("https://disease.sh/v3/covid-19/historical/all?lastdays=all")
  );
}

async function exampleWorldwide() {
  focusTab("exampleWorldwide");
  createBarChart(
    await apiFetch("https://disease.sh/v3/covid-19/all"),
    "Worldwide"
  );
}

async function exampleUsa() {
  focusTab("exampleUsa");
  createBarChart(
    await apiFetch("https://disease.sh/v3/covid-19/countries/usa"),
    "USA"
  );
}

async function exampleVaccines() {
  focusTab("exampleVaccines");
  createGeoChart(
    await apiFetch(
      "https://disease.sh/v3/covid-19/vaccine/coverage/countries?lastdays=1"
    )
  );
}

document.getElementById("exampleHistory").onclick = exampleHistory;
document.getElementById("exampleWorldwide").onclick = exampleWorldwide;
document.getElementById("exampleUsa").onclick = exampleUsa;
document.getElementById("exampleVaccines").onclick = exampleVaccines;
exampleHistory();

let googleChartsLoaded = false;
function loadGoogleCharts() {
  return new Promise((resolve) => {
    if (googleChartsLoaded) {
      resolve();
    } else {
      google.charts.load("current", {
        packages: ["line", "corechart", "geochart"],
        mapsApiKey: "AIzaSyD-9tSrke72PouQMnMX-a7eZSW0jkFMBWY",
      });
      google.charts.setOnLoadCallback(resolve);
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  // Get all "navbar-burger" elements
  const $navbarBurgers = Array.prototype.slice.call(
    document.querySelectorAll(".navbar-burger"),
    0
  );

  // Check if there are any navbar burgers
  if ($navbarBurgers.length > 0) {
    // Add a click event on each of them
    $navbarBurgers.forEach((el) => {
      el.addEventListener("click", () => {
        // Get the target from the "data-target" attribute
        const target = el.dataset.target;
        const $target = document.getElementById(target);

        // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
        el.classList.toggle("is-active");
        $target.classList.toggle("is-active");
      });
    });
  }
});

function checkScroll(){
  if (window.scrollY > 0) {
    document.getElementsByClassName("navbar")[0].classList.add("scrolled");
  } else {
    document.getElementsByClassName("navbar")[0].classList.remove("scrolled");
  }
}

document.addEventListener("scroll", checkScroll);
checkScroll()

if (!localStorage.getItem("hideNewsletter"))
  document.getElementById("newsletter").classList.remove("is-hidden");

document.getElementById("newsletterClose").addEventListener("click", () => {
  document.getElementById("newsletter").classList.add("is-hidden");
  localStorage.setItem("hideNewsletter", true);
});

document
  .getElementById("newsletterForm")
  .addEventListener("submit", (event) => {
    event.preventDefault();
    newsletterFormBtn.classList.add("is-loading");
  });

import JsonViewer from "./jsonViewer.js";

async function apiFetch(url, barChart = false) {
  document.getElementById("requestUrl").innerText = url;
  document.getElementById("requestUrl").href = url;

  const response = await fetch(url);
  const json = await response.json();

  document.getElementById("response").innerHTML = "";
  new JsonViewer({
    container: document.getElementById("response"),
    data: JSON.stringify(json, null, 2),
    theme: "light",
    expand: true,
  });

  barChart ? createBarChart(json) : createLineChart(json);
}

async function createLineChart(dataset) {
  await loadGoogleCharts();
  const data = new google.visualization.DataTable();

  data.addColumn("datetime", "Date");
  data.addColumn("number", "New Cases");
  data.addColumn("number", "Deaths");
  data.addColumn("number", "Recovered");

  Object.keys(dataset.cases).forEach((date) => {
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
    height: 400,
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
    height: 400,
    pieHole: 0.4,
  };

  const chart = new google.visualization.PieChart(
    document.getElementById("chart")
  );
  console.log(data);
  chart.draw(data, options);
}

function focusTab(name) {
  const tabs = document.getElementsByClassName("tabs")[0].children[0].children;
  for (let i = 0; i < tabs.length; i++) {
    tabs[i].classList.remove("is-active");
  }
  document.getElementById(name).parentElement.classList.add("is-active");
}

function exampleHistory() {
  focusTab("exampleHistory");
  apiFetch("https://disease.sh/v3/covid-19/historical/all?lastdays=all");
}

function exampleWorldwide() {
  focusTab("exampleWorldwide");
  apiFetch("https://disease.sh/v3/covid-19/all", true, "Worldwide");
}

function exampleUsa() {
  focusTab("exampleUsa");
  apiFetch("https://disease.sh/v3/covid-19/countries/usa", true, "USA");
}

document.getElementById("exampleHistory").onclick = exampleHistory;
document.getElementById("exampleWorldwide").onclick = exampleWorldwide;
document.getElementById("exampleUsa").onclick = exampleUsa;
exampleHistory();

let googleChartsLoaded = false;
function loadGoogleCharts() {
  return new Promise((resolve) => {
    if (googleChartsLoaded) {
      resolve();
    } else {
      google.charts.load("current", { packages: ["line", "corechart"] });
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

document.addEventListener("scroll", () => {
  if (window.scrollY > 180) {
    document.getElementById("titleSmall").classList.remove("is-invisible");
    document.getElementById("titleBig").classList.add("is-invisible");
  } else {
    document.getElementById("titleSmall").classList.add("is-invisible");
    document.getElementById("titleBig").classList.remove("is-invisible");
  }
});

document
  .getElementById("newsletterForm")
  .addEventListener("submit", (event) => {
    event.preventDefault();
    newsletterFormBtn.classList.add("is-loading");
  });

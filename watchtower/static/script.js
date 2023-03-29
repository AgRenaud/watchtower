function formatBytes(bytes, decimals = 2) {
    if (!+bytes) return '0 Bytes'

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

function update_data(data) {

  let mem_usage = data.mem_usage;
  let cpu_usage = data.cpu_usage;
  let disk_usage = data.disk_usage;

  update_disk_usage(disk_usage);
  update_mem_usage(mem_usage);
  update_cpu_usage(cpu_usage);

}

function init_cpu_usage(cpu_usage) {
  var section = document.getElementById("cpu-usage-section");
  var cores = [];

  for (let [index, _] of cpu_usage.entries()) {
    let id = "core-" + index;

    var coreSection = document.createElement("div");
    coreSection.id = id;
    coreSection.className = "core-usage";

    var identifier = document.createElement("label")
    identifier.innerHTML = id;
    coreSection.appendChild(identifier);

    var meter = document.createElement("meter");
    meter.id = id;
    meter.max = 100;
    meter.min = 0;
    meter.optimum = 0;
    meter.low = 66;
    meter.high = 80;
    meter.value = 0;
    coreSection.appendChild(meter);

    var currentValue = document.createElement("p");
    currentValue.innerHTML = "0 %"
    coreSection.appendChild(currentValue);

    cores.push(coreSection);
  }

  section.append(...cores);
}

function update_cpu_usage(cpu_usage) {
  var section = document.getElementById("cpu-usage-section");

  if (section.childNodes.length == 0) {
    console.log("Init cpus")
    init_cpu_usage(cpu_usage);
  }

  var section = document.getElementById("cpu-usage-section");

 for (let [index, core] of cpu_usage.entries()) {
    let id = "core-" + index;
    var coreSection = document.getElementById(id);
    var meter = coreSection.getElementsByTagName("meter")[0];
    var currentValue = coreSection.getElementsByTagName("p")[0];
    meter.value = core.ratio;
    currentValue.innerHTML = core.ratio + " %"
  }

}

function update_disk_usage(disk_usage) {
  let total = disk_usage.disk_total;
  let used = disk_usage.disk_used;
  document.getElementById("disk-usage-progress-bar").value = 100 * used / total;
}

function update_mem_usage(mem_usage) {
  let total = mem_usage.mem_total;
  let used = mem_usage.mem_used;
  document.getElementById("mem-usage-progress-bar").value = 100 * used / total;
}

let socket = new WebSocket("ws://127.0.0.1:8000/ws");

socket.onopen = function(e) {
  console.log("[open] Connection established");
};

socket.onmessage = function(event) {
  let data = JSON.parse(event.data)
  update_data(data)
};


socket.onclose = function(event) {
  if (event.wasClean) {
    console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
  } else {
    console.log('[close] Connection died');
  }
};

socket.onerror = function(error) {
  console.log(`[error]`);
};

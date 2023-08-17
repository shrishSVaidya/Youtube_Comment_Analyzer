const loadingAnimation = document.getElementById('loadingAnimation');

function startLoadingAnimation() {
  loadingAnimation.style.display = 'block';
}

function stopLoadingAnimation() {
  loadingAnimation.style.display = 'none';
}

function analyzeComments(){
var inputstring = document.getElementById("youtubeLink").value;
document.getElementById("youtubeLink").value='';
startLoadingAnimation();
sendDataToFlask(inputstring);

}

function generatePieChart(chartData) {
  const charts = document.querySelectorAll('.chart canvas');
  document.getElementById("char1").innerHTML = "Toxic";
  document.getElementById("char2").innerHTML = "Severe Toxic";
  document.getElementById("char3").innerHTML = "Obscene";
  document.getElementById("char4").innerHTML = "Insult";
  document.getElementById("char5").innerHTML = "Negative";
  document.getElementById("char6").innerHTML = "Positive";
  document.getElementById("char7").innerHTML = "Neutral";
  setTimeout(() => {
    stopLoadingAnimation();
    // Process the received data here
  }, 1); 
  charts.forEach((canvas, index) => {
    console.log(chartData[index])
    createDoughnutChart(canvas, chartData[index]);
  });
}

function sendDataToFlask(inputString) {
// Send the string to Flask endpoint

fetch('/process_string', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({ inputString }),
})
.then(response => response.json())
.then(data => {
    // Here, 'data' will contain the response from the Flask server
    // console.log(data); // You can use the data for your charts
    generatePieChart(data);
})
.catch(error => {
    console.error('Error:', error);
});



}



// const createDoughnutChart = (canvas, data) => {
//   const ctx = canvas.getContext('2d');
  
//   const centerX = canvas.width / 2;
//   const centerY = canvas.height / 2;
//   const radius = Math.min(centerX, centerY) * 0.7;
//   const totalValue = data.reduce((sum, d) => sum + d.value, 0);
//   let startAngle = -Math.PI / 2;
  
//   data.forEach(d => {
//       const arcAngle = (d.value / totalValue) * 2 * Math.PI;
      
//       ctx.beginPath();
//       ctx.arc(centerX, centerY, radius, startAngle, startAngle + arcAngle);
//       ctx.lineTo(centerX, centerY);
//       ctx.fillStyle = d.color;
//       ctx.fill();

      
      
//       startAngle += arcAngle;
//   });
  
//   ctx.beginPath();
//   ctx.arc(centerX, centerY, radius * 0.5, 0, 2 * Math.PI);
//   ctx.fillStyle = '#FFFFFF';
//   ctx.fill();

//   ctx.fillStyle = '#000000'; // Set the text color
//   ctx.font = '30px Arial';   // Set the font
//   ctx.textAlign = 'center';
//   ctx.textBaseline = 'middle';
//   const val = data[0].value;
//   const formattedValue = `${(val).toFixed(0)}%`;
//   ctx.fillText(formattedValue, centerX, centerY);
// };




const createDoughnutChart = (canvas, data) => {
  const ctx = canvas.getContext('2d');
  
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = Math.min(centerX, centerY) * 0.7;
  const totalValue = data.reduce((sum, d) => sum + d.value, 0);
  let startAngle = -Math.PI / 2;
  
  const animationDuration = 5000; // Animation duration in milliseconds
  const animationStartTime = Date.now();
  
  const animate = () => {
    const currentTime = Date.now();
    const elapsedTime = currentTime - animationStartTime;
    const progress = Math.min(elapsedTime / animationDuration, 1);
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    data.forEach(d => {
      const arcAngle = (d.value / totalValue) * 2 * Math.PI * progress;
      const endAngle = startAngle + arcAngle;
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.lineTo(centerX, centerY);
      ctx.fillStyle = d.color;
      ctx.fill();
      
      startAngle += arcAngle;
    });
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.5, 0, 2 * Math.PI);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();

    ctx.fillStyle = '#000000'; // Set the text color
    ctx.font = '30px Arial';   // Set the font
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const val = data[0].value;
    const formattedValue = `${(val).toFixed(0)}%`;
    ctx.fillText(formattedValue, centerX, centerY);

    if (progress < 1) {
      requestAnimationFrame(animate);

    }

  };

  requestAnimationFrame(animate);

};



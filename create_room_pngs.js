var PSD = require('psd');
let path = 'C:/users/...'; //The path to your psd, which is the same to save your images.
let psdName = 'your.psd'; //The name of the psd
var psd = PSD.fromFile(`${path}/${psdName}`);
let prefix = 'your prefix';	//The prefix of the images you want to use

psd.parse();

psd.tree().descendants().forEach((node) => {
	if(node.name == 'Images'){
		node._children.forEach((layer) =>{
			PSD.open(`${path}/${psdName}`).then(function (psd) {
					return layer.layer.image.saveAsPng(`${path}/${prefix + layer.layer.name}.png`);
				}).then(function () {
				console.log(`Saved ${prefix + layer.layer.name}.png at ${path}`);
			});
		})
	}
});
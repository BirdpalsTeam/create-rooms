const fs = require('fs');
var PSD = require('psd');
const room = 'cabin';
var psd = PSD.fromFile(`./examples/${room}/${room}.psd`);
const imagesPath = `C:/Users/renat/Pictures/Birdpals/Create Room psd/examples/${room}`; //Path to where are the images you`re going to use
const spriteSheetPath = `C:/Users/renat/Pictures/Birdpals/Create Room psd/examples/${room}`; //Path to your sprite sheet
const spriteSheetJsonPath = `C:/Users/renat/Pictures/Birdpals/Pixi Js version/public/JSONS`; //Path to your sprite sheet json
const jsonName = 'roomsJson';
let dirImages = fs.readdirSync(imagesPath); //Read the data from the directory of your images
let prefix = `${room}_`;	//The prefix of the images you want to use
let desiredImageName = `${room}`; //The name of the image of the new spritesheet
const packer = 'MaxRectsBin'; //Change it if you want
const packerMethod = 'BestLongSideFit'; //Change it if you want
var images = new Array();

const texturePacker = require("free-tex-packer-core");

psd.parse();

let objects = {}; 
let collisionPoints = new Array();
let triggers = new Array();

psd.tree().descendants().forEach((node) => {
	if(node.name.includes('Collisions') == true){
		//[point.x1, point.y1], [point.x2, point.y2]
		node._children.forEach((layer)=>{
			collisionPoints.push([layer.coords.left + (layer.width / 2), layer.coords.top]);
		})
	}else if(node.name == 'Triggers'){
		node._children.forEach((layer) => {
			let layerName = layer.name.split(" ");
			let command = layerName[0];
			let commandContext = layerName[1];
			triggers.push([layer.coords.left, layer.coords.top, layer.coords.right, layer.coords.bottom, command, commandContext]);
		})
	}else if(node.name == 'Images'){
		node._children.forEach((layer) =>{
			if(layer.name == 'Background' || layer.name == 'Foreground'){}else{ //Did this way because for some reason != is not working
				objects[layer.name] = {x: layer.coords.left, y: layer.coords.top};
			}
		})
	}
});

dirImages.filter((file)=>{
	if(file.indexOf(`${prefix}`) == 0 && file.includes('.png') == true){ //Gets the files that have the prefix wanted
		images.push({path: file, contents: fs.readFileSync(`${imagesPath}/${file}`)});
	}
})

texturePacker(images, {allowRotation: false, packer: packer , packerMethod: packerMethod, exporter:"Pixi", textureName: desiredImageName}, (files, error) => {
	if (error) {
		return	console.log(error);
	} else {
		for(let item of files){
			if(item.name.includes('.json')){
				let wholeBuffer = JSON.parse(item.buffer);
				let frame = wholeBuffer.frames;
				for(let images in frame){
					let newPos = objects[images.split('.png')[0].split(prefix)[1]]; //Get the pos object
					if(newPos !== undefined){
						frame[images].position = {x: newPos.x, y: newPos.y}
					}
				}
				wholeBuffer.frames = frame;
				wholeBuffer.meta.image = `../Sprites/rooms/${desiredImageName}/${desiredImageName}.png`;
				item.buffer = Buffer.from(JSON.stringify(wholeBuffer, null, 2));
			}
			fs.writeFile(`${spriteSheetPath}/${item.name}`, item.buffer, function(err) {
				if(err) {
					return console.log(err);
				}
				console.log(`${item.name} was saved at ${spriteSheetPath}`);
			}); 
		}
		
		let json = JSON.parse(fs.readFileSync(`${spriteSheetJsonPath}/${jsonName}.json`));
		json[desiredImageName].colliders = collisionPoints;
		if(triggers.length >= 1){
			json[desiredImageName].triggers = triggers;
		}
		fs.writeFile(`${spriteSheetJsonPath}/${jsonName}.json`, Buffer.from(JSON.stringify(json, null, 2)),(err)=>{
			if(err){
				return console.log(err);
			}
			console.log(`${jsonName}.json was saved at ${spriteSheetJsonPath}`);
		})
	}
});
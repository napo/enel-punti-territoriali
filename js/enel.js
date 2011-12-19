var map, selectsControls;

function addli(s) {
	s = '<li>' + s + '</li>';
	return (s)	
}

function createInfoBox(data) {

	return(infobox)
}

function writeServizi(s) { 
	result = "<table>";
	services = s.split(",");
	for( var i =0; i <services.length; i++) {
		result += "<tr><td>"+services[i] +"</td></tr>";
	}
	result += "</table>";
	return result;
} 
function writeOrari(s) {
	orario = "<table>";
	namedays = new Array();
	namedays[1] = "domenica";
	namedays[2] = "luned&igrave;";
	namedays[3] = "marted&igrave;";
	namedays[4] = "mercoled&igrave;";
	namedays[5] = "gioved&igrave;";
	namedays[6] = "venerd&igrave;";
	namedays[7] = "sabato";
	days = data.attributes.Orari.split(",");
	giorno = "";
	for( var i =0; i <days.length; i++) {
		d = days[i].split(":");
		if (giorno == namedays[d[0]]) {
			giorno = "&nbsp;";
		} else {
			giorno = namedays[d[0]];
		}	
		if (d[1].length == 1) {
			d[1] = "0" + d[1];
		}
		orario += "<tr><td><strong>" + giorno  + "</strong></td><td>" + d[1] + ":" + d[2] + "</td><td>" + d[3] + ":" + d[4] + "</td></tr>";
	}
	orario += "</table>";
	return orario;
}
function init(){
	var option = {
		projection: new OpenLayers.Projection("EPSG:900913"),
		displayProjection: new OpenLayers.Projection("EPSG:4326")
	};
	map = new OpenLayers.Map('map', option);
	olmapnik = new OpenLayers.Layer.OSM("OpenStreetMap Mapnik", "http://tile.openstreetmap.org/${z}/${x}/${y}.png");
	olmapquest = new OpenLayers.Layer.OSM("OpenStreetMap Mapquest", "http://otile2.mqcdn.com/tiles/1.0.0/osm/${z}/${x}/${y}.png");
	map.addLayer(olmapquest);	
	map.addLayer(olmapnik);
	map.setBaseLayer(olmapquest);
	var ls= new OpenLayers.Control.LayerSwitcher(); 
	map.addControl(ls); 
	ls.maximizeControl(); 


	function onPopupClose(evt) {
		selectControl.unselect(selectedFeature);
	}
	function onFeatureSelect(feature){
		selectedFeature = feature;
		datatable = '';
		for (i=0; i<feature.cluster.length; i++) { 
			data = feature.cluster[i];
			infobox ='<ul class="infobox">';
			name ='<strong> '+data.attributes.Codice_Negozio.replace("_", " ")+'</strong>';
			if (data.attributes.Home_Page != 'None') {
				name = '<a href="' + data.attributes.Home_Page +'" target="_new">' + name + '</a>'
			}
			infobox += addli(name);
			infobox += '<i>';
			infobox += addli(data.attributes.Indirizzo);
			infobox += addli(data.attributes.Cap + " " + data.attributes.Citta);
			infobox += '</i>';
			infobox += addli(data.attributes.Provincia + " - " + data.attributes.Regione);
			infobox += addli("tel. " + data.attributes.Telefono);
			infobox += addli("tel. " + data.attributes.Telefono_2);
			infobox += addli("<br/>");
			infobox += addli(data.attributes.Descrizione);
			infobox += addli("<br/><strong>Servizi</strong><br/>"+writeServizi(data.attributes.Servizi));
			infobox += addli("<br/><strong>Orari</strong><br/>"+writeOrari(data.attributes.Orari));
			infobox +='</ul>';
			
			infobox += '---</div>';
			datatable += infobox;
		}


		popup = new OpenLayers.Popup.FramedCloud("chicken", 
			feature.geometry.getBounds().getCenterLonLat(),
			new OpenLayers.Size(1000,500),
			datatable,
			null,
			true,
			onPopupClose
		); 
		feature.popup = popup;
		map.addPopup(popup);
			
	}
	function onFeatureUnselect(feature) {
		map.removePopup(feature.popup);
		feature.popup.destroy();
		feature.popup = null;
	}

	var style = new OpenLayers.Style({
		pointRadius: "${radius}",
		fillColor: "#FA3939",
		fillOpacity: 0.5,
		strokeColor: "#cc6633",
		strokeWidth: "${width}",
		strokeOpacity: 0.8,
		label: "${tlabel}",
		fontSize: "${wlabel}",
		fontFamily: 'Verdana,Arial, Helvetica, Geneva'
	}, {
		context: {
			width: function(feature) {
			return (feature.cluster) ? 2 : 1;
			},
			wlabel: function(feature) {
				return(8+ ((feature.attributes.count/8)*5));
			},
			radius: function(feature) {
			var pix = 3;
			if(feature.cluster) {
				switch(feature.cluster) { 
  				case 2: 
					pix = 5;
					break;
				case 3: 
					pix = 7;
					break;
  				default: 
					pix = 10;
					break;
				}
			}	
			return pix;
			},
			tlabel: function(feature) {
				if (feature.cluster) {
					return(feature.attributes.count);
				} 
			}
		}
	});

	

	var strategy = new OpenLayers.Strategy.Cluster(); //{distance: 20, threshold: 1});
	enel = new OpenLayers.Layer.GML("ENEL - punti territoriali", 
								"data/enel.GeoJSON",{ 
					format: OpenLayers.Format.GeoJSON,
					strategies: [strategy],
					styleMap: new OpenLayers.StyleMap({"default": style})});
	map.addLayer(enel);
	selectControl = new OpenLayers.Control.SelectFeature(
		[enel],
		{
			clickout: true, toggle: false, 
			multiple: false, hover: false, 
			toggleKey: "ctrlKey", // ctrl key removes from selection
			multipleKey: "shiftKey" // shift key adds to selection
		}
	);
	map.addControl(selectControl);
	selectControl.activate();
	enel.events.on({
		"featureselected": function(e) {
			onFeatureSelect(e.feature);
		},
		"featureunselected": function(e) {
			onFeatureUnselect(e.feature);
		}
	});
	extent = new OpenLayers.Bounds(7.060473,36.257865,18.474642,47.184912).transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection("EPSG:900913"));
	//extent= new OpenLayers.Bounds(1184891.7547713,5797571.7693338,1280514.4771427,5875843.286287)
	map.zoomToExtent(extent);
};



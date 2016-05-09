// JScript File

/*

Code Example to Add a Dynamic Map to VEMap

agisve_dyn_service = new ITNexus.Libraries.WebADF.JavaScript.VE.ArcGISDynamicService();
agisve_dyn_service.CreateLayer("https://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Louisville/LOJIC_PublicSafety_Louisville/MapServer","LOJIC_PublicSafety_Louisville");
agisve_dyn_service.addDynamicService(map,1,true);


*/



//Loads The ArcGIS Javascript API file to interact with the Service to Query, etc.
loadjscssfile("https://serverapi.arcgisonline.com/jsapi/arcgis/?v=1.5", "js");

Type.registerNamespace('ITNexus.Libraries.WebADF.JavaScript.VE');
Type.registerNamespace('ITNexus.Libraries.WebADF.JavaScript.VE.ArcGISDynamicService');


//Create an array to hold all the Dynamic Services
ArcGISDynamicServices = ITNexus.Libraries.WebADF.JavaScript.VE._ArcGISDynamicServices = []; //Internal list of panels


ITNexus.Libraries.WebADF.JavaScript.VE.ArcGISDynamicService = function()
{

    ITNexus.Libraries.WebADF.JavaScript.VE.ArcGISDynamicService.initializeBase(this);
	ITNexus.Libraries.WebADF.JavaScript.VE._ArcGISDynamicServices[ITNexus.Libraries.WebADF.JavaScript.VE._ArcGISDynamicServices.length] = this; 

    this._MapServiceURL = null;//Map Service REST URL
    this._LayerID = null; //Layer Id for VEMap Layer ID
    
    //esri.layers.ArcGISDynamicMapServiceLayer from the ArcGIS Server Javascript API 
    // Layer Visibility is taken from this object so to turn off a layer 
    // Use the ArcGIS Javascript API and change the layers visibility
    this.ArcGISDynamicMapServiceLayer = null; 
    this._map = null; //VeMap Control
    this._ZIndex = null; //Z Index to Add to the Map
}

ITNexus.Libraries.WebADF.JavaScript.VE.ArcGISDynamicService.prototype =
{
    //Creates the new Dynamic Map Layer to add to VEMap
    CreateLayer : function(MapServiceURL, LayerID)
    {
        this._MapServiceURL = MapServiceURL;
        this._LayerID = LayerID;
        this.ArcGISDynamicMapServiceLayer = new esri.layers.ArcGISDynamicMapServiceLayer(this._MapServiceURL, {id:this._LayerID});
        this._map = null;
        this._ZIndex = null;
    },


    //Adds the Object to the VEMap
    addDynamicService : function(VEMap,ZIndex,visibleOnLoad)
    {
        this._map = VEMap;
        this._ZIndex = ZIndex;
        this._VisibleOnLoad = visibleOnLoad;
        
        if(this._map.GetTileLayerByID(this._LayerID)==null)
        {
            var view = this._map.GetMapView();
            var top = view.TopLeftLatLong.Latitude;
            var left = view.TopLeftLatLong.Longitude;
            var bottom = view.BottomRightLatLong.Latitude;
            var right = view.BottomRightLatLong.Longitude;
            

            var bounds = [new VELatLongRectangle(new VELatLong(top, left),new VELatLong(bottom, right))];
            var opacity = 0.4;

            
            var tileSourceSpec = new VETileSourceSpecification(this._LayerID, 
            "");
            tileSourceSpec.NumServers = 1;
            tileSourceSpec.Bounds = bounds;
            tileSourceSpec.MinZoomLevel = 0;
            tileSourceSpec.MaxZoomLevel = 18;
            tileSourceSpec.Opacity = opacity;
            tileSourceSpec.ZIndex = ZIndex;
            tileSourceSpec.GetTilePath = this.__getTilePath;

            
            this._map.AddTileLayer(tileSourceSpec, visibleOnLoad);
        }
        else
        {
            this._map._mapMap.ShowTileLayer(this._LayerID);
        }

    },
    
    
    //VEMethod used to draw each tile from the ArcGIS Rest interface
    __getTilePath : function(tileContext)
    {
        var arcGISDynamicService = null; 
        for (var i = 0; i < ArcGISDynamicServices.length; i++)
        {
            var tempDynServices = ArcGISDynamicServices[i];
            if (this.ID == tempDynServices._LayerID)
            {
                arcGISDynamicService = tempDynServices;
                break;
            }
        }
        if (arcGISDynamicService != null)
        {
            if(tileContext != null && tileContext != "undefined")
            {
                var minx = arcGISDynamicService.__getMinX(tileContext.XPos,tileContext.ZoomLevel);
                var maxx = arcGISDynamicService.__getMaxX(tileContext.XPos,tileContext.ZoomLevel);
                var miny = arcGISDynamicService.__getMinY(tileContext.YPos, tileContext.ZoomLevel);
                var maxy = arcGISDynamicService.__getMaxY(tileContext.YPos, tileContext.ZoomLevel);
                
                var path = arcGISDynamicService._MapServiceURL + "/export?bbox=" + minx + "%2C" + miny + "%2C" + maxx + "%2C" + maxy + "&bboxSR=4326&format=png&f=image&size=256%2C256&transparent=true&imageSR=102113";
                if (arcGISDynamicService.ArcGISDynamicMapServiceLayer != null && arcGISDynamicService.ArcGISDynamicMapServiceLayer != "undefined")
                {
                    if (arcGISDynamicService.ArcGISDynamicMapServiceLayer.visibleLayers)
                    {
                        var strVisLayers = "";
                        var visLayers = arcGISDynamicService.ArcGISDynamicMapServiceLayer.visibleLayers;
                        for (var i = 0; i < visLayers.length; i++)
                        {
                            if (i==0)
                            {
                                strVisLayers += visLayers[i]
                            }
                            else
                            {
                                strVisLayers += "," + visLayers[i]
                            }
                        }
                        path = path + "&layers=show:" + strVisLayers;
                    }
                }
                return path;
            }
        }
    },
    
    //gets the Minx of the tile
    __getMinX : function(XPos,ZoomLevel)
    {
        var minx = 0.0;

        var PixelXMin = XPos * 256;
        minx = (((PixelXMin * 360) / (256 * Math.pow(2, ZoomLevel))) - 180);
        
        return minx;
    },

    //gets the Maxx of the tile
    __getMaxX : function(XPos,ZoomLevel)
    {
        var maxx = 0.0;

        var PixelXMax = ((XPos + 1) * 256) - 1;
        maxx = (((PixelXMax * 360) / (256 * Math.pow(2, ZoomLevel))) - 180);
        
        return maxx;
    },

    //gets the Miny of the tile
    __getMinY : function(YPos,ZoomLevel)
    {
        var miny = 0.0;

        var PixelYMax = ((YPos + 1) * 256) - 1;

        var denom = (256 * Math.pow(2, ZoomLevel));
        var eMaxNum = (PixelYMax / denom);
        var eMaxFactor = (Math.pow(Math.E, (0.5 - eMaxNum) * 4 * Math.PI));
        miny = (Math.asin((eMaxFactor - 1) / (eMaxFactor + 1)) * (180 / Math.PI));   
        return miny;
    },

    //gets the Maxy of the tile
    __getMaxY : function(YPos,ZoomLevel)
    {
        var maxy = 0.0;
        var PixelYMin = YPos * 256;

        var denom = (256 * Math.pow(2, ZoomLevel));

        var eMinNum = (PixelYMin / denom);
        var eMinFactor = (Math.pow(Math.E, (0.5 - eMinNum) * 4 * Math.PI));
        maxy = (Math.asin((eMinFactor - 1) / (eMinFactor + 1)) * (180 / Math.PI));
        
        return maxy;
    }
}


//dynamically adds a javascript file
function loadjscssfile(filename, filetype){
 if (filetype=="js"){ //if filename is a external JavaScript file
  var fileref=document.createElement('script')
  fileref.setAttribute("type","text/javascript")
  fileref.setAttribute("src", filename)
 }
 else if (filetype=="css"){ //if filename is an external CSS file
  var fileref=document.createElement("link")
  fileref.setAttribute("rel", "stylesheet")
  fileref.setAttribute("type", "text/css")
  fileref.setAttribute("href", filename)
 }
 if (typeof fileref!="undefined")
  document.getElementsByTagName("head")[0].appendChild(fileref)
}

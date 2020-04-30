# CERR Process
**Preparing Data**

Create a boundary file from the most current munibounds and from counties. Erase the county layer with the municipal boundaries to create an
unincorporated only layer. Intersect the county and municipal layers to create a municipal layer with county info. Merge these two layers.
Add LGID field (text, 5).

**Process**

First portion of CERR_no_arcpy.py loads the necessary data from Oracle as a csv.

Create a shapefile from the data and spatially join it to the base data.

***Optional depending on circumstances***

Create a line file from the base and then buffer that by 100 feet to locate questionable point LGIDs. Review and alter LGIDs as necessary.

**Process continued**

Run the second portion of CERR_no_arcpy.py to update the data in Oracle with the proper LGID.

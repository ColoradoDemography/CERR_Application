# CERR Process
**Preparing Data**

Create a boundary file from the most current munibounds and from counties. Erase the county layer with the municipal boundaries to create an
unincorporated only layer. Intersect the county and municipal layers to create a municipal layer with county info. Merge these two layers.
Add LGID field (text, 5). Muni LGID is in the city field, add the LGID for unincorporated areas from the county's LGID. 

**Process**

Download the necessary data as a csv from DLG_FP.DD_CERR_EMP by selecting where GEO_CHECKED IS NULL and GEO_SCORE IS NOT NULL

Create a shapefile from the data by geocoding the coordinates in the csv
Spatially join the addresses to the muni/county shapefile to assign an LGID

***Optional depending on circumstances***

Create a line file from the base and then buffer that by 100 feet to locate questionable point LGIDs. Review and alter LGIDs as necessary.

**Process continued**

Convert the dbf of the shapefile into a csv and then run the second portion of CERR_no_arcpy.py to update the data in Oracle with the proper LGID.

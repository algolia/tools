import panel from "@/store/modules/panels/panel";
import app from "@/store/modules/apps/app";

let panelsData, appsData;

if (process.env.NODE_ENV !== 'production') {
    panelsData = {
        leftPanel: panel('AJ0P3S7DWQ', 'metaparams'),
        rightPanel: panel('N6E3P8T447', 'osm_planet'),
    };

    appsData = {
        'AJ0P3S7DWQ': app('AJ0P3S7DWQ', 'ce1181300d403d21311d5bca9ef1e6fb', 'metaparams'),
        'N6E3P8T447': app('N6E3P8T447', '43502e0d4dbf4749fc6511fcd63c4e51', 'osm_planet'),
        'RSBCBF0EG8': app('RSBCBF0EG8', '362a46f9db7603d913d9f4eea9a47fde', 'HN_Item_production'),
        '932LAAGOT3': app('932LAAGOT3', '0ccadf4e8378f8e43143b7975d5d366f', null),
        'Z0YPI1PLPQ': app('Z0YPI1PLPQ', 'c71af6d48215015a71a6cddb2ab647f0', null),
        'DKPVOB44GB': app('DKPVOB44GB', '1dc1632fd29b695ec1cefe2c1449445d', null),
    };
} else {
    panelsData = {
        leftPanel: panel(null, null),
        rightPanel: panel(null, null)
    };
    appsData = {};
}

export {panelsData, appsData};
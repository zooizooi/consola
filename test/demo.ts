// import '../lib/style.scss';

// import Consola from '../lib/Consola';
import Consola from '../dist/index';
console.log(Consola);

const consola = new Consola();

function noclip() {
    consola.showMessage('no clip enabled');
}

consola.addCommand('noclip', 'fly through walls!', noclip);
 
/** 
 * Commands
 * https://www.mohaaaa.co.uk/AAAAMOHAA/content/cvars-commands-list
 * 
 * kill
 * fps "1|0"
 * cl_greenfps "1|0"
 * noclip
 * restart
 * quit
 * cmdlist
 * 
 * consola.registerCommand('noclip', 'description', callback)
*/

/**
 * Consola specifc logs
 * - Chuncks loaded
 * - Shaders loaded etc
 */
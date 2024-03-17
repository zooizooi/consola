import '../lib/style.scss';
import Consola from '../lib/Consola';
// import Consola from '../dist/index';

window.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.key === 'ArrowLeft') {
        console.log('arrowLeft');
    }
    if (event.key === 'ArrowRight') {
        console.log('arrowRight');
    }
});

const consola = new Consola();
consola.show();

function noclip() {
    consola.showMessage('no clip enabled');
}

consola.addCommand('noclip', 'Fly through walls!', noclip);
consola.addCommand('speed', (value: number) => {
    if (value) {
        consola.showMessage(`Speed updated: ${value}`);
    } else {
        consola.showMessage('Add value to define speed');
    }
});

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
*/

/**
 * Consola specifc logs
 * - Chuncks loaded
 * - Shaders loaded etc
 */
/* Launcher Options
 * Created by @lordsergioinspa
 * Model: PC_01
 */
"use strict";

var term, pc, boot_start_time, params, init_state;

function terminal_start()
{
    term = new Term(80, 60, term_handler);
    term.open();
}

/* Connect to Serial Port Emulated */
function term_handler()
{
    pc.serial.send_chars(str);
}

function get_boot_system_time()
{
    return (+new Date()) - boot_start_time;
}
var binaries = [false,false,false];

function loadbinary(url,slot)
{
  var req, binary_array, len, typed_arrays_exist;
  
  req = new XMLHttpRequest();
  
  req.open('GET', url, true);
  
  typed_arrays_exist = ('ArrayBuffer' in window && 'Uint8Array' in window);
  if (typed_arrays_exist && 'mozResponseType' in req){
      reg.responseType = 'arraybuffer';
    } else if (typed_arrays_exist && 'responseType' in req) {
      req.responseType = ' arraybuffer';
    } else {
      req.overrideMimeType('text/plain; charset=x-user-defined');
      typed_arrays_exist = false;
    }
    
    req.onerror = function(e) {
      throw "Error while loading" + req.statusText;
    };
    
    req.onload = function (e) {
      console.log('load binary')
      if (req.readyState === 4) {
        if (req.status === 200) {
          if (typed_arrays_exist && 'mozResponse' in req) {
              binaries[slot] = req.mozResponse;
            } else if (typed_arrays_exist && req.mozResponseArrayBuffer) {
              binaries[slot] = req.mozResponseArrayBuffer;
            } else if ('responseType' in req) {
              binaries[slot] = req.responseText;
            }
            
          } else {
            throw"Error while loading" + url;
          }
        }
      }
      req.send(null);
};

function checkbinaries() {
  console.log("checkbinaries: ",(binaries[0]!=false),(binaries[1]!=false),(binaries[2]!=false));
  if((binaries[0]!=false) && (binaries[1]!=false) && (binaries[2]!=false)){
      console.log("The binaries done loading, calling start_emulation()");
      start_emulation();
    } else { 
      setTimeout(checkbinaries, 500);
    }
};

/* Load System Disk */
function load_binaries()
{
    console.log('Loading binaries..')
    pc = new PCEmulator(params)

    loadbinary("disk/vmkernel.bin",   0x00100000, 1);
    loadbinary("disk/boot-start.bin", 0x10000,    2);
    loadbinary("disk/disk.bin",       0x00400000, 3);

    cheackbinaries()
}

function start_emulation(ret)
{
    var cmdline_addr;
    
    params= new Object();

    /* memory size (in bytes) */
    params.mem_size = 16 * 1024 * 1024;

    /* Now booting from /dev/ram0 in the system emulated */
    init_state.initrd_size = ret;

    /* Set the kernel cmdline */
    cmdline_addr = 0xf800;
    pc.cpu.write_string(cmdline_addr, "console=ttyS0 root=/dev/ram0 rw init=/sbin/init username=root quiet");

    pc.cpu.eip = init_state.start_addr;
    pc.cpu.regs[0] = init_state.params.mem_size; /* eax */
    pc.cpu.regs[3] = init_state.initrd_size; /* ebx = initrd_size (optional ram disk) */
    pc.cpu.regs[1] = cmdline_addr; /* ecx */

    boot_start_time = (+new Date());

    pc.start();
    
}
terminal_start();

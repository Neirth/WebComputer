/*
  Load disk and configurations
*/
"use strict";

var term, pc;

function term_start()
{
  term = new Term(80, 60, term_handler);
  
  term.open();
}

function term_handler(str)
{
  pc.serial.send_chars(str);
}

function get_boot_time()
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

function load_binaries() {
  console.log("Requesting binaries");
  loadbinary("vmkernel.bin", 0);
  loadbinary("stadistic-os.bin", 1);
  loadbinary("boot-system.bin", 2);
  
  checkbinaries();
};

function  start_emulation()
{
  var  initrd_size, params, cmdline_addr;
  
  params= new Object();
  
  /* serial output chars */
  params.serial_write = term.write.bind(term);
  
  /* memory size (in bytes) */
  params.mem_size = 16 * 1024 * 1024;
  
  params.get_boot_time = get_boot_time;
  
  pc = new PCEmulator(params);
  
  pc.load_binary(binaries[0], 0x00100000);
  
  initrd_size = pc.load_binary(binaries[1], 0x00400000);
  
  pc.load_binary(binaries[2], 0x10000);
  
  /*Set the Linux Kernel command line*/
  
  cmdline_addr = 0xf800;
  pc.cpu.write_string(cmdline_addr,"console=ttyS0 root=/dev/ram0 ro init=/sbin/stadistic");
  
  pc.cpu.eip = 0x10000;
  pc.cpu.regs[0] = params.mem_size;
  pc.cpu.regs[3] = initrd_size;
  pc.cpu.regs[1] = cmdline_addr; 
  
  boot_start_time = (+new Date());
  
  pc.start();
}

term_start();

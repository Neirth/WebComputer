/* Launcher Options
 * Created by @lordsergioinspa
 * Model: PC_01
 */
"use strict";

var term, pc, boot_start_time, init_state;

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

/* Load System Disk */
function start_emulation()
{
    pc = new PCEmulator()

    pc.load_binary("disk/vmkernel.bin",   0x00100000, callsystem);
    pc.load_binary("disk/boot-start.bin", 0x10000,    callsystem);
    pc.load_binary("disk/disk.bin",       0x00400000, callsystem);
}

function callsystem(ret)
{
    var cmdline_addr;

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

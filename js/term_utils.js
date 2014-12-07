/* JavaScript Terminal Util's
 * Created by @lordsergioinspa
 * Model: TERM_01
 */
"use strict";

function Term(aa, ba, ca) {
    this.w = aa;
    this.h = ba;
    this.cur_h = ba;
    this.tot_h = 1000;
    this.y_base = 0;
    this.y_disp = 0;
    this.x = 0;
    this.y = 0;
    this.cursorstate = 0;
    this.handler = ca;
    this.convert_lf_to_crlf = false;
    this.state = 0;
    this.output_queue = "";
    this.bg_colors = ["#000000", "#ff0000", "#00ff00", "#ffff00", "#0000ff", "#ff00ff", "#00ffff", "#ffffff"];
    this.fg_colors = ["#000000", "#ff0000", "#00ff00", "#ffff00", "#0000ff", "#ff00ff", "#00ffff", "#ffffff"];
    this.def_attr = (7 << 3) | 0;
    this.cur_attr = this.def_attr;
    this.is_mac = (navigator.userAgent.indexOf("Mac") >= 0) ? true : false;
    this.key_rep_state = 0;
    this.key_rep_str = "";
}
Term.prototype.open = function() {
    var y, da, i, ea, c;
    this.lines = new Array();
    c = 32 | (this.def_attr << 16);
    for (y = 0; y < this.cur_h; y++) {
        da = new Array();
        for (i = 0; i < this.w; i++) da[i] = c;
        this.lines[y] = da;
    }
    document.writeln('<table border="0" cellspacing="0" cellpadding="0">');
    for (y = 0; y < this.h; y++) {
        document.writeln('<tr><td class="term" id="tline' + y + '"></td></tr>');
    }
    document.writeln('</table>');
    this.refresh(0, this.h - 1);
    document.addEventListener("keydown", this.keyDownHandler.bind(this), true);
    document.addEventListener("keypress", this.keyPressHandler.bind(this), true);
    ea = this;
    setInterval(function() {
        ea.cursor_timer_cb();
    }, 1000);
};
Term.prototype.refresh = function(fa, ga) {
    var ha, y, da, ia, c, w, i, ja, ka, la, ma, na, oa;
    for (y = fa; y <= ga; y++) {
        oa = y + this.y_disp;
        if (oa >= this.cur_h) oa -= this.cur_h;
        da = this.lines[oa];
        ia = "";
        w = this.w;
        if (y == this.y && this.cursor_state && this.y_disp == this.y_base) {
            ja = this.x;
        } else {
            ja = -1;
        }
        la = this.def_attr;
        for (i = 0; i < w; i++) {
            c = da[i];
            ka = c >> 16;
            c &= 0xffff;
            if (i == ja) {
                ka = -1;
            }
            if (ka != la) {
                if (la != this.def_attr) ia += '</span>';
                if (ka != this.def_attr) {
                    if (ka == -1) {
                        ia += '<span class="termReverse">';
                    } else {
                        ia += '<span style="';
                        ma = (ka >> 3) & 7;
                        na = ka & 7;
                        if (ma != 7) {
                            ia += 'color:' + this.fg_colors[ma] + ';';
                        }
                        if (na != 0) {
                            ia += 'background-color:' + this.bg_colors[na] + ';';
                        }
                        ia += '">';
                    }
                }
            }
            switch (c) {
                case 32:
                    ia += "&nbsp;";
                    break;
                case 38:
                    ia += "&amp;";
                    break;
                case 60:
                    ia += "&lt;";
                    break;
                case 62:
                    ia += "&gt;";
                    break;
                default:
                    if (c < 32) {
                        ia += "&nbsp;";
                    } else {
                        ia += String.fromCharCode(c);
                    }
                    break;
            }
            la = ka;
        }
        if (la != this.def_attr) {
            ia += '</span>';
        }
        ha = document.getElementById("tline" + y);
        ha.innerHTML = ia;
    }
};
Term.prototype.cursor_timer_cb = function() {
    this.cursor_state ^= 1;
    this.refresh(this.y, this.y);
};
Term.prototype.show_cursor = function() {
    if (!this.cursor_state) {
        this.cursor_state = 1;
        this.refresh(this.y, this.y);
    }
};
Term.prototype.scroll = function() {
    var y, da, x, c, oa;
    if (this.cur_h < this.tot_h) {
        this.cur_h++;
    }
    if (++this.y_base == this.cur_h) this.y_base = 0;
    this.y_disp = this.y_base;
    c = 32 | (this.def_attr << 16);
    da = new Array();
    for (x = 0; x < this.w; x++) da[x] = c;
    oa = this.y_base + this.h - 1;
    if (oa >= this.cur_h) oa -= this.cur_h;
    this.lines[oa] = da;
};
Term.prototype.scroll_disp = function(n) {
    var i, oa;
    if (n >= 0) {
        for (i = 0; i < n; i++) {
            if (this.y_disp == this.y_base) break;
            if (++this.y_disp == this.cur_h) this.y_disp = 0;
        }
    } else {
        n = -n;
        oa = this.y_base + this.h;
        if (oa >= this.cur_h) oa -= this.cur_h;
        for (i = 0; i < n; i++) {
            if (this.y_disp == oa) break;
            if (--this.y_disp < 0) this.y_disp = this.cur_h - 1;
        }
    }
    this.refresh(0, this.h - 1);
};
Term.prototype.write = function(pa) {
    function qa(y) {
        fa = Math.min(fa, y);
        ga = Math.max(ga, y);
    }

    function ra(s, x, y) {
        var l, i, c, oa;
        oa = s.y_base + y;
        if (oa >= s.cur_h) oa -= s.cur_h;
        l = s.lines[oa];
        c = 32 | (s.def_attr << 16);
        for (i = x; i < s.w; i++) l[i] = c;
        qa(y);
    }

    function sa(s, ta) {
        var j, n;
        if (ta.length == 0) {
            s.cur_attr = s.def_attr;
        } else {
            for (j = 0; j < ta.length; j++) {
                n = ta[j];
                if (n >= 30 && n <= 37) {
                    s.cur_attr = (s.cur_attr & ~(7 << 3)) | ((n - 30) << 3);
                } else if (n >= 40 && n <= 47) {
                    s.cur_attr = (s.cur_attr & ~7) | (n - 40);
                } else if (n == 0) {
                    s.cur_attr = s.def_attr;
                }
            }
        }
    }
    var ua = 0;
    var va = 1;
    var wa = 2;
    var i, c, fa, ga, l, n, j, oa;
    fa = this.h;
    ga = -1;
    qa(this.y);
    if (this.y_base != this.y_disp) {
        this.y_disp = this.y_base;
        fa = 0;
        ga = this.h - 1;
    }
    for (i = 0; i < pa.length; i++) {
        c = pa.charCodeAt(i);
        switch (this.state) {
            case ua:
                switch (c) {
                    case 10:
                        if (this.convert_lf_to_crlf) {
                            this.x = 0;
                        }
                        this.y++;
                        if (this.y >= this.h) {
                            this.y--;
                            this.scroll();
                            fa = 0;
                            ga = this.h - 1;
                        }
                        break;
                    case 13:
                        this.x = 0;
                        break;
                    case 8:
                        if (this.x > 0) {
                            this.x--;
                        }
                        break;
                    case 9:
                        n = (this.x + 8) & ~7;
                        if (n <= this.w) {
                            this.x = n;
                        }
                        break;
                    case 27:
                        this.state = va;
                        break;
                    default:
                        if (c >= 32) {
                            if (this.x >= this.w) {
                                this.x = 0;
                                this.y++;
                                if (this.y >= this.h) {
                                    this.y--;
                                    this.scroll();
                                    fa = 0;
                                    ga = this.h - 1;
                                }
                            }
                            oa = this.y + this.y_base;
                            if (oa >= this.cur_h) oa -= this.cur_h;
                            this.lines[oa][this.x] = (c & 0xffff) | (this.cur_attr << 16);
                            this.x++;
                            qa(this.y);
                        }
                        break;
                }
                break;
            case va:
                if (c == 91) {
                    this.esc_params = new Array();
                    this.cur_param = 0;
                    this.state = wa;
                } else {
                    this.state = ua;
                }
                break;
            case wa:
                if (c >= 48 && c <= 57) {
                    this.cur_param = this.cur_param * 10 + c - 48;
                } else {
                    this.esc_params[this.esc_params.length] = this.cur_param;
                    this.cur_param = 0;
                    if (c == 59) break;
                    this.state = ua;
                    switch (c) {
                        case 65:
                            n = this.esc_params[0];
                            if (n < 1) n = 1;
                            this.y -= n;
                            if (this.y < 0) this.y = 0;
                            break;
                        case 66:
                            n = this.esc_params[0];
                            if (n < 1) n = 1;
                            this.y += n;
                            if (this.y >= this.h) this.y = this.h - 1;
                            break;
                        case 67:
                            n = this.esc_params[0];
                            if (n < 1) n = 1;
                            this.x += n;
                            if (this.x >= this.w - 1) this.x = this.w - 1;
                            break;
                        case 68:
                            n = this.esc_params[0];
                            if (n < 1) n = 1;
                            this.x -= n;
                            if (this.x < 0) this.x = 0;
                            break;
                        case 72:
                            {
                                var xa, oa;
                                oa = this.esc_params[0] - 1;
                                if (this.esc_params.length >= 2) xa = this.esc_params[1] - 1;
                                else xa = 0;
                                if (oa < 0) oa = 0;
                                else if (oa >= this.h) oa = this.h - 1;
                                if (xa < 0) xa = 0;
                                else if (xa >= this.w) xa = this.w - 1;
                                this.x = xa;
                                this.y = oa;
                            }
                            break;
                        case 74:
                            ra(this, this.x, this.y);
                            for (j = this.y + 1; j < this.h; j++) ra(this, 0, j);
                            break;
                        case 75:
                            ra(this, this.x, this.y);
                            break;
                        case 109:
                            sa(this, this.esc_params);
                            break;
                        case 110:
                            this.queue_chars("\x1b[" + (this.y + 1) + ";" + (this.x + 1) + "R");
                            break;
                        default:
                            break;
                    }
                }
                break;
        }
    }
    qa(this.y);
    if (ga >= fa) this.refresh(fa, ga);
};
Term.prototype.writeln = function(pa) {
    this.write(pa + '\r\n');
};
Term.prototype.keyDownHandler = function(ya) {
    var pa;
    pa = "";
    switch (ya.keyCode) {
        case 8:
            pa = "";
            break;
        case 9:
            pa = "\t";
            break;
        case 13:
            pa = "\r";
            break;
        case 27:
            pa = "\x1b";
            break;
        case 37:
            pa = "\x1b[D";
            break;
        case 39:
            pa = "\x1b[C";
            break;
        case 38:
            if (ya.ctrlKey) {
                this.scroll_disp(-1);
            } else {
                pa = "\x1b[A";
            }
            break;
        case 40:
            if (ya.ctrlKey) {
                this.scroll_disp(1);
            } else {
                pa = "\x1b[B";
            }
            break;
        case 46:
            pa = "\x1b[3~";
            break;
        case 45:
            pa = "\x1b[2~";
            break;
        case 36:
            pa = "\x1bOH";
            break;
        case 35:
            pa = "\x1bOF";
            break;
        case 33:
            if (ya.ctrlKey) {
                this.scroll_disp(-(this.h - 1));
            } else {
                pa = "\x1b[5~";
            }
            break;
        case 34:
            if (ya.ctrlKey) {
                this.scroll_disp(this.h - 1);
            } else {
                pa = "\x1b[6~";
            }
            break;
        default:
            if (ya.ctrlKey) {
                if (ya.keyCode >= 65 && ya.keyCode <= 90) {
                    pa = String.fromCharCode(ya.keyCode - 64);
                } else if (ya.keyCode == 32) {
                    pa = String.fromCharCode(0);
                }
            } else if ((!this.is_mac && ya.altKey) || (this.is_mac && ya.metaKey)) {
                if (ya.keyCode >= 65 && ya.keyCode <= 90) {
                    pa = "\x1b" + String.fromCharCode(ya.keyCode + 32);
                }
            }
            break;
    }
    if (pa) {
        if (ya.stopPropagation) ya.stopPropagation();
        if (ya.preventDefault) ya.preventDefault();
        this.show_cursor();
        this.key_rep_state = 1;
        this.key_rep_str = pa;
        this.handler(pa);
        return false;
    } else {
        this.key_rep_state = 0;
        return true;
    }
};
Term.prototype.keyPressHandler = function(ya) {
    var pa, za;
    if (ya.stopPropagation) ya.stopPropagation();
    if (ya.preventDefault) ya.preventDefault();
    pa = "";
    if (!("charCode" in ya)) {
        za = ya.keyCode;
        if (this.key_rep_state == 1) {
            this.key_rep_state = 2;
            return false;
        } else if (this.key_rep_state == 2) {
            this.show_cursor();
            this.handler(this.key_rep_str);
            return false;
        }
    } else {
        za = ya.charCode;
    }
    if (za != 0) {
        if (!ya.ctrlKey && ((!this.is_mac && !ya.altKey) || (this.is_mac && !ya.metaKey))) {
            pa = String.fromCharCode(za);
        }
    }
    if (pa) {
        this.show_cursor();
        this.handler(pa);
        return false;
    } else {
        return true;
    }
};
Term.prototype.queue_chars = function(pa) {
    this.output_queue += pa;
    if (this.output_queue) setTimeout(this.outputHandler.bind(this), 0);
};
Term.prototype.outputHandler = function() {
    if (this.output_queue) {
        this.handler(this.output_queue);
        this.output_queue = "";
    }
};

/* add the bind function if not present */
if (!Function.prototype.bind) {
    Function.prototype.bind = function(obj) {
        var slice1 = [].slice,
        args = slice1.call(arguments, 1),
        self = this,
        nop = function () {},
        bound = function () {
            return self.apply( this instanceof nop ? this : ( obj || {} ),
                               args.concat( slice1.call(arguments) ) );   
        };
        
        nop.prototype = self.prototype;
        
        bound.prototype = new nop();
        
        return bound;
    };
}

/* include script 'filename' */
function include(filename)
{
   document.write('<script type="text/javascript" src="' + filename + 
                  '"><' + '/script>');
}

/* Load a binary data. cb(data, len) is called with data = null and
 * len = -1 in case of error. Otherwise len is the length in
 * bytes. data can be a string, Array or Uint8Array depending on
 * the implementation. */
function this.cpu.load_binary(url, cb)
{
    var req, typed_array, is_ie;

    //    console.log("load_binary: url=" + url);

    req = new XMLHttpRequest();
    req.open('GET', url, true);

    /* completion function */
    req.onreadystatechange = function() {
        var err, data, len, i, buf;

        if (req.readyState == 4) {
            //            console.log("req status=" + req.status);
            if (req.status != 200 && req.status != 0) {
                cb(null, -1);
            } else {
                if (is_ie) {
                    data = new VBArray(req.responseBody).toArray();
                    len = data.length;
                    cb(data, len);
                } else {
                    if (typed_array && 'mozResponse' in req) {
                        /* firefox 6 beta */
                        data = req.mozResponse;
                    } else if (typed_array && req.mozResponseArrayBuffer) {
                        /* Firefox 4 */
                        data = req.mozResponseArrayBuffer;
                    } else if ('responseType' in req) {
                        /* Note: in Android 3.0 there is no typed arrays so its
                           returns UTF8 text */
                        data = req.response;
                    } else {
                        data = req.responseText;
                        typed_array = false;
                    }
                
                    if (typed_array) {
                        len = data.byteLength;
                        buf = new Uint8Array(data, 0, len);
                        cb(buf, len);
                    } else {
                        len = data.length;
                        cb(data, len);
                    }
                }
            }
        }
    };

    is_ie = (typeof ActiveXObject == "function");
    if (!is_ie) {
        typed_array = ('ArrayBuffer' in window && 'Uint8Array' in window);
        if (typed_array && 'mozResponseType' in req) {
            /* firefox 6 beta */
            req.mozResponseType = 'arraybuffer';
        } else if (typed_array && 'responseType' in req) {
            /* Chrome */
            req.responseType = 'arraybuffer';
        } else {
            req.overrideMimeType('text/plain; charset=x-user-defined');
            typed_array = false;
        }
    }
    req.send(null);
}

/* Keyboard Emulation */
function KBD(PC, reset_callback) {
    PC.register_ioport_read(0x64, 1, 1, this.read_status.bind(this));
    PC.register_ioport_write(0x64, 1, 1, this.write_command.bind(this));
    this.reset_request = reset_callback;
}
KBD.prototype.read_status = function(mem8_loc) {
    return 0;
};
KBD.prototype.write_command = function(mem8_loc, x) {
    switch (x) {
        case 0xfe: // Resend command. Other commands are, apparently, ignored.
            this.reset_request();
            break;
        default:
            break;
    }
};

/* CMOS Ram Memory, actually just the RTC Clock Emulator */
/*
   In this implementation, bytes are stored in the RTC in BCD format
   binary -> bcd: bcd = ((bin / 10) << 4) | (bin % 10)
   bcd -> binary: bin = ((bcd / 16) * 10) + (bcd & 0xf)
*/
function bin_to_bcd(a) { return ((a / 10) << 4) | (a % 10);}

function CMOS(PC) {
    var time_array, d;
    time_array = new Uint8Array(128);
    this.cmos_data = time_array;
    this.cmos_index = 0;
    d = new Date();
    time_array[0] = bin_to_bcd(d.getUTCSeconds());
    time_array[2] = bin_to_bcd(d.getUTCMinutes());
    time_array[4] = bin_to_bcd(d.getUTCHours());
    time_array[6] = bin_to_bcd(d.getUTCDay());
    time_array[7] = bin_to_bcd(d.getUTCDate());
    time_array[8] = bin_to_bcd(d.getUTCMonth() + 1);
    time_array[9] = bin_to_bcd(d.getUTCFullYear() % 100);
    time_array[10] = 0x26;
    time_array[11] = 0x02;
    time_array[12] = 0x00;
    time_array[13] = 0x80;
    time_array[0x14] = 0x02;
    PC.register_ioport_write(0x70, 2, 1, this.ioport_write.bind(this));
    PC.register_ioport_read(0x70, 2, 1, this.ioport_read.bind(this));
}
CMOS.prototype.ioport_write = function(mem8_loc, data) {
    if (mem8_loc == 0x70) {
	    // the high order bit is used to indicate NMI masking
        // low order bits are used to address CMOS
        // the index written here is used on an ioread 0x71
        this.cmos_index = data & 0x7f;
    }
};
CMOS.prototype.ioport_read = function(mem8_loc) {
    var data;
    if (mem8_loc == 0x70) {
        return 0xff;
    } else {
	    // else here => 0x71, i.e., CMOS read
        data = this.cmos_data[this.cmos_index];
        if (this.cmos_index == 10)
	    // flip the UIP (update in progress) bit on a read
            this.cmos_data[10] ^= 0x80;
        else if (this.cmos_index == 12)
	    // Always return interrupt status == 0
            this.cmos_data[12] = 0x00;
        return data;
    }
};

/* Main PC Emulator Routine */

// used as callback wrappers for emulated PIT and PIC chips
function set_hard_irq_wrapper(irq) { this.hard_irq = irq;}
function return_cycle_count() { return this.cycle_count; }

function PCEmulator(params) {
    var cpu;
    cpu = new CPU_X86();
    this.cpu = cpu;
    cpu.phys_mem_resize(params.mem_size);
    this.init_ioports();
    this.register_ioport_write(0x80, 1, 1, this.ioport80_write);
    this.pic    = new PIC_Controller(this, 0x20, 0xa0, set_hard_irq_wrapper.bind(cpu));
    this.pit    = new PIT(this, this.pic.set_irq.bind(this.pic, 0),  return_cycle_count.bind(cpu));
    this.cmos   = new CMOS(this);
    this.serial = new Serial(this, 0x3f8, this.pic.set_irq.bind(this.pic, 4), params.serial_write);
    this.kbd    = new KBD(this, this.reset.bind(this));
    this.reset_request = 0;
    if (params.clipboard_get && params.clipboard_set) {
        this.jsclipboard = new clipboard_device(this, 0x3c0, params.clipboard_get, params.clipboard_set, params.get_boot_time);
    }
    cpu.ld8_port       = this.ld8_port.bind(this);
    cpu.ld16_port      = this.ld16_port.bind(this);
    cpu.ld32_port      = this.ld32_port.bind(this);
    cpu.st8_port       = this.st8_port.bind(this);
    cpu.st16_port      = this.st16_port.bind(this);
    cpu.st32_port      = this.st32_port.bind(this);
    cpu.get_hard_intno = this.pic.get_hard_intno.bind(this.pic);
}

PCEmulator.prototype.load_binary = function(binary_array, mem8_loc) { return this.cpu.load_binary(binary_array, mem8_loc); };

PCEmulator.prototype.start = function() { setTimeout(this.timer_func.bind(this), 10); };

PCEmulator.prototype.timer_func = function() {
    var exit_status, Ncycles, do_reset, err_on_exit, PC, cpu;
    PC = this;
    cpu = PC.cpu;
    Ncycles = cpu.cycle_count + 100000;

    do_reset = false;
    err_on_exit = false;

    exec_loop: while (cpu.cycle_count < Ncycles) {
        PC.pit.update_irq();
        exit_status = cpu.exec(Ncycles - cpu.cycle_count);
        if (exit_status == 256) {
            if (PC.reset_request) {
                do_reset = true;
                break;
            }
        } else if (exit_status == 257) {
            err_on_exit = true;
            break;
        } else {
            do_reset = true;
            break;
        }
    }
    if (!do_reset) {
        if (err_on_exit) {
            setTimeout(this.timer_func.bind(this), 10);
        } else {
            setTimeout(this.timer_func.bind(this), 0);
        }
    }
};

PCEmulator.prototype.init_ioports = function() {
    var i, readw, writew;
    this.ioport_readb_table = new Array();
    this.ioport_writeb_table = new Array();
    this.ioport_readw_table = new Array();
    this.ioport_writew_table = new Array();
    this.ioport_readl_table = new Array();
    this.ioport_writel_table = new Array();
    readw = this.default_ioport_readw.bind(this);
    writew = this.default_ioport_writew.bind(this);
    for (i = 0; i < 1024; i++) {
        this.ioport_readb_table[i] = this.default_ioport_readb;
        this.ioport_writeb_table[i] = this.default_ioport_writeb;
        this.ioport_readw_table[i] = readw;
        this.ioport_writew_table[i] = writew;
        this.ioport_readl_table[i] = this.default_ioport_readl;
        this.ioport_writel_table[i] = this.default_ioport_writel;
    }
};

PCEmulator.prototype.default_ioport_readb = function(port_num) {
    var x;
    x = 0xff;
    return x;
};

PCEmulator.prototype.default_ioport_readw = function(port_num) {
    var x;
    x = this.ioport_readb_table[port_num](port_num);
    port_num = (port_num + 1) & (1024 - 1);
    x |= this.ioport_readb_table[port_num](port_num) << 8;
    return x;
};

PCEmulator.prototype.default_ioport_readl = function(port_num) {
    var x;
    x = -1;
    return x;
};

PCEmulator.prototype.default_ioport_writeb = function(port_num, x) {};

PCEmulator.prototype.default_ioport_writew = function(port_num, x) {
    this.ioport_writeb_table[port_num](port_num, x & 0xff);
    port_num = (port_num + 1) & (1024 - 1);
    this.ioport_writeb_table[port_num](port_num, (x >> 8) & 0xff);
};

PCEmulator.prototype.default_ioport_writel = function(port_num, x) {};

PCEmulator.prototype.ld8_port = function(port_num) {
    var x;
    x = this.ioport_readb_table[port_num & (1024 - 1)](port_num);
    return x;
};

PCEmulator.prototype.ld16_port = function(port_num) {
    var x;
    x = this.ioport_readw_table[port_num & (1024 - 1)](port_num);
    return x;
};

PCEmulator.prototype.ld32_port = function(port_num) {
    var x;
    x = this.ioport_readl_table[port_num & (1024 - 1)](port_num);
    return x;
};

PCEmulator.prototype.st8_port  = function(port_num, x) { this.ioport_writeb_table[port_num & (1024 - 1)](port_num, x); };
PCEmulator.prototype.st16_port = function(port_num, x) { this.ioport_writew_table[port_num & (1024 - 1)](port_num, x); };
PCEmulator.prototype.st32_port = function(port_num, x) { this.ioport_writel_table[port_num & (1024 - 1)](port_num, x); };

PCEmulator.prototype.register_ioport_read = function(start, len, iotype, io_callback) {
    var i;
    switch (iotype) {
        case 1:
            for (i = start; i < start + len; i++) {
                this.ioport_readb_table[i] = io_callback;
            }
            break;
        case 2:
            for (i = start; i < start + len; i += 2) {
                this.ioport_readw_table[i] = io_callback;
            }
            break;
        case 4:
            for (i = start; i < start + len; i += 4) {
                this.ioport_readl_table[i] = io_callback;
            }
            break;
    }
};

PCEmulator.prototype.register_ioport_write = function(start, len, iotype, io_callback) {
    var i;
    switch (iotype) {
        case 1:
            for (i = start; i < start + len; i++) {
                this.ioport_writeb_table[i] = io_callback;
            }
            break;
        case 2:
            for (i = start; i < start + len; i += 2) {
                this.ioport_writew_table[i] = io_callback;
            }
            break;
        case 4:
            for (i = start; i < start + len; i += 4) {
                this.ioport_writel_table[i] = io_callback;
            }
            break;
    }
};

PCEmulator.prototype.ioport80_write = function(mem8_loc, data) {}; //POST codes! Seem to be ignored?
PCEmulator.prototype.reset = function() { this.request_request = 1; };

/* 8254 Programmble Interrupt Timer Emulator */
function PIT(PC, set_irq_callback, cycle_count_callback) {
    var s, i;
    this.pit_channels = new Array();
    for (i = 0; i < 3; i++) {
        s = new IRQCH(cycle_count_callback);
        this.pit_channels[i] = s;
        s.mode = 3;
        s.gate = (i != 2) >> 0;
        s.pit_load_count(0);
    }
    this.speaker_data_on = 0;
    this.set_irq = set_irq_callback;
    // Ports:
    // 0x40: Channel 0 data port
    // 0x61: Control
    PC.register_ioport_write(0x40, 4, 1, this.ioport_write.bind(this));
    PC.register_ioport_read(0x40, 3, 1, this.ioport_read.bind(this));
    PC.register_ioport_read(0x61, 1, 1, this.speaker_ioport_read.bind(this));
    PC.register_ioport_write(0x61, 1, 1, this.speaker_ioport_write.bind(this));
}

function IRQCH(cycle_count_callback) {
    this.count = 0;
    this.latched_count = 0;
    this.rw_state = 0;
    this.mode = 0;
    this.bcd = 0;
    this.gate = 0;
    this.count_load_time = 0;
    this.get_ticks = cycle_count_callback;
    this.pit_time_unit = 1193182 / 2000000;
}
IRQCH.prototype.get_time = function() {
    return Math.floor(this.get_ticks() * this.pit_time_unit);
};
IRQCH.prototype.pit_get_count = function() {
    var d, dh;
    d = this.get_time() - this.count_load_time;
    switch (this.mode) {
        case 0:
        case 1:
        case 4:
        case 5:
            dh = (this.count - d) & 0xffff;
            break;
        default:
            dh = this.count - (d % this.count);
            break;
    }
    return dh;
};
IRQCH.prototype.pit_get_out = function() {
    var d, eh;
    d = this.get_time() - this.count_load_time;
    switch (this.mode) {
        default:
        case 0:	// Interrupt on terminal count
            eh = (d >= this.count) >> 0;
            break;
        case 1: // One shot
            eh = (d < this.count) >> 0;
            break;
        case 2:	// Frequency divider
            if ((d % this.count) == 0 && d != 0)
                eh = 1;
            else
                eh = 0;
            break;
        case 3:	// Square wave
            eh = ((d % this.count) < (this.count >> 1)) >> 0;
            break;
        case 4:	// SW strobe
        case 5:	// HW strobe
            eh = (d == this.count) >> 0;
            break;
    }
    return eh;
};
IRQCH.prototype.get_next_transition_time = function() {
    var d, fh, base, gh;
    d = this.get_time() - this.count_load_time;
    switch (this.mode) {
        default:
        case 0:	// Interrupt on terminal count
        case 1: // One shot
            if (d < this.count)
                fh = this.count;
            else
                return -1;
            break;
        case 2: // Frequency divider
            base = (d / this.count) * this.count;
            if ((d - base) == 0 && d != 0)
                fh = base + this.count;
            else
                fh = base + this.count + 1;
            break;
        case 3: // Square wave
            base = (d / this.count) * this.count;
            gh = ((this.count + 1) >> 1);
            if ((d - base) < gh)
                fh = base + gh;
            else
                fh = base + this.count;
            break;
        case 4: // SW strobe
        case 5:	// HW strobe
            if (d < this.count)
                fh = this.count;
            else if (d == this.count)
                fh = this.count + 1;
            else
                return -1;
            break;
    }
    fh = this.count_load_time + fh;
    return fh;
};
IRQCH.prototype.pit_load_count = function(x) {
    if (x == 0)
        x = 0x10000;
    this.count_load_time = this.get_time();
    this.count = x;
};



PIT.prototype.ioport_write = function(mem8_loc, x) {
    var hh, ih, s;
    mem8_loc &= 3;
    if (mem8_loc == 3) {
        hh = x >> 6;
        if (hh == 3)
            return;
        s = this.pit_channels[hh];
        ih = (x >> 4) & 3;
        switch (ih) {
            case 0:
                s.latched_count = s.pit_get_count();
                s.rw_state = 4;
                break;
            default:
                s.mode = (x >> 1) & 7;
                s.bcd = x & 1;
                s.rw_state = ih - 1 + 0;
                break;
        }
    } else {
        s = this.pit_channels[mem8_loc];
        switch (s.rw_state) {
            case 0:
                s.pit_load_count(x);
                break;
            case 1:
                s.pit_load_count(x << 8);
                break;
            case 2:
            case 3:
                if (s.rw_state & 1) {
                    s.pit_load_count((s.latched_count & 0xff) | (x << 8));
                } else {
                    s.latched_count = x;
                }
                s.rw_state ^= 1;
                break;
        }
    }
};
PIT.prototype.ioport_read = function(mem8_loc) {
    var Pg, ma, s;
    mem8_loc &= 3;
    s = this.pit_channels[mem8_loc];
    switch (s.rw_state) {
        case 0:
        case 1:
        case 2:
        case 3:
            ma = s.pit_get_count();
            if (s.rw_state & 1)
                Pg = (ma >> 8) & 0xff;
            else
                Pg = ma & 0xff;
            if (s.rw_state & 2)
                s.rw_state ^= 1;
            break;
        default:
        case 4:
        case 5:
            if (s.rw_state & 1)
                Pg = s.latched_count >> 8;
            else
                Pg = s.latched_count & 0xff;
            s.rw_state ^= 1;
            break;
    }
    return Pg;
};
PIT.prototype.speaker_ioport_write = function(mem8_loc, x) {
    this.speaker_data_on = (x >> 1) & 1;
    this.pit_channels[2].gate = x & 1;
};
PIT.prototype.speaker_ioport_read = function(mem8_loc) {
    var eh, s, x;
    s = this.pit_channels[2];
    eh = s.pit_get_out();
    x = (this.speaker_data_on << 1) | s.gate | (eh << 5);
    return x;
};
PIT.prototype.update_irq = function() {
    this.set_irq(1);
    this.set_irq(0);
};
/* 8259A PIC (Programmable Interrupt Controller) Emulation Code */

function PIC(PC, port_num) {
    PC.register_ioport_write(port_num, 2, 1, this.ioport_write.bind(this));
    PC.register_ioport_read(port_num, 2, 1, this.ioport_read.bind(this));
    this.reset();
}
PIC.prototype.reset = function() {
    this.last_irr = 0;
    this.irr = 0; //Interrupt Request Register
    this.imr = 0; //Interrupt Mask Register
    this.isr = 0; //In-Service Register
    this.priority_add = 0;
    this.irq_base = 0;
    this.read_reg_select = 0;
    this.special_mask = 0;
    this.init_state = 0;
    this.auto_eoi = 0;
    this.rotate_on_autoeoi = 0;
    this.init4 = 0;
    this.elcr = 0; // Edge/Level Control Register
    this.elcr_mask = 0;
};
PIC.prototype.set_irq1 = function(irq, Qf) {
    var ir_register;
    ir_register = 1 << irq;
    if (Qf) {
        if ((this.last_irr & ir_register) == 0)
            this.irr |= ir_register;
        this.last_irr |= ir_register;
    } else {
        this.last_irr &= ~ir_register;
    }
};
/*
  The priority assignments for IRQ0-7 seem to be maintained in a
  cyclic order modulo 8 by the 8259A.  On bootup, it default to:

  Priority: 0 1 2 3 4 5 6 7
  IRQ:      7 6 5 4 3 2 1 0

  but can be rotated automatically or programmatically to a state e.g.:

  Priority: 5 6 7 0 1 2 3 4
  IRQ:      7 6 5 4 3 2 1 0
*/
PIC.prototype.get_priority = function(ir_register) {
    var priority;
    if (ir_register == 0)
        return -1;
    priority = 7;
    while ((ir_register & (1 << ((priority + this.priority_add) & 7))) == 0)
        priority--;
    return priority;
};
PIC.prototype.get_irq = function() {
    var ir_register, in_service_priority, priority;
    ir_register = this.irr & ~this.imr;
    priority = this.get_priority(ir_register);
    if (priority < 0)
        return -1;
    in_service_priority = this.get_priority(this.isr);
    if (priority > in_service_priority) {
        return priority;
    } else {
        return -1;
    }
};
PIC.prototype.intack = function(irq) {
    if (this.auto_eoi) {
        if (this.rotate_on_auto_eoi)
            this.priority_add = (irq + 1) & 7;
    } else {
        this.isr |= (1 << irq);
    }
    if (!(this.elcr & (1 << irq)))
        this.irr &= ~(1 << irq);
};
PIC.prototype.ioport_write = function(mem8_loc, x) {
    var priority;
    mem8_loc &= 1;
    if (mem8_loc == 0) {
        if (x & 0x10) {
	    /*
	      ICW1
	      // 7:5 = address (if MCS-80/85 mode)
	      // 4 == 1
	      // 3: 1 == level triggered, 0 == edge triggered
	      // 2: 1 == call interval 4, 0 == call interval 8
	      // 1: 1 == single PIC, 0 == cascaded PICs
	      // 0: 1 == send ICW4

	     */
            this.reset();
            this.init_state = 1;
            this.init4 = x & 1;
            if (x & 0x02)
                throw "single mode not supported";
            if (x & 0x08)
                throw "level sensitive irq not supported";
        } else if (x & 0x08) {
            if (x & 0x02)
                this.read_reg_select = x & 1;
            if (x & 0x40)
                this.special_mask = (x >> 5) & 1;
        } else {
            switch (x) {
                case 0x00:
                case 0x80:
                    this.rotate_on_autoeoi = x >> 7;
                    break;
                case 0x20:
                case 0xa0:
                    priority = this.get_priority(this.isr);
                    if (priority >= 0) {
                        this.isr &= ~(1 << ((priority + this.priority_add) & 7));
                    }
                    if (x == 0xa0)
                        this.priority_add = (this.priority_add + 1) & 7;
                    break;
                case 0x60:
                case 0x61:
                case 0x62:
                case 0x63:
                case 0x64:
                case 0x65:
                case 0x66:
                case 0x67:
                    priority = x & 7;
                    this.isr &= ~(1 << priority);
                    break;
                case 0xc0:
                case 0xc1:
                case 0xc2:
                case 0xc3:
                case 0xc4:
                case 0xc5:
                case 0xc6:
                case 0xc7:
                    this.priority_add = (x + 1) & 7;
                    break;
                case 0xe0:
                case 0xe1:
                case 0xe2:
                case 0xe3:
                case 0xe4:
                case 0xe5:
                case 0xe6:
                case 0xe7:
                    priority = x & 7;
                    this.isr &= ~(1 << priority);
                    this.priority_add = (priority + 1) & 7;
                    break;
            }
        }
    } else {
        switch (this.init_state) {
            case 0:
                this.imr = x;
                this.update_irq();
                break;
            case 1:
                this.irq_base = x & 0xf8;
                this.init_state = 2;
                break;
            case 2:
                if (this.init4) {
                    this.init_state = 3;
                } else {
                    this.init_state = 0;
                }
                break;
            case 3:
                this.auto_eoi = (x >> 1) & 1;
                this.init_state = 0;
                break;
        }
    }
};
PIC.prototype.ioport_read = function(Ug) {
    var mem8_loc, return_register;
    mem8_loc = Ug & 1;
    if (mem8_loc == 0) {
        if (this.read_reg_select)
            return_register = this.isr;
        else
            return_register = this.irr;
    } else {
        return_register = this.imr;
    }
    return return_register;
};


function PIC_Controller(PC, master_PIC_port, slave_PIC_port, cpu_set_irq_callback) {
    this.pics = new Array();
    this.pics[0] = new PIC(PC, master_PIC_port);
    this.pics[1] = new PIC(PC, slave_PIC_port);
    this.pics[0].elcr_mask = 0xf8;
    this.pics[1].elcr_mask = 0xde;
    this.irq_requested = 0;
    this.cpu_set_irq = cpu_set_irq_callback;
    this.pics[0].update_irq = this.update_irq.bind(this);
    this.pics[1].update_irq = this.update_irq.bind(this);
}
PIC_Controller.prototype.update_irq = function() {
    var slave_irq, irq;
    slave_irq = this.pics[1].get_irq();
    if (slave_irq >= 0) {
        this.pics[0].set_irq1(2, 1);
        this.pics[0].set_irq1(2, 0);
    }
    irq = this.pics[0].get_irq();
    if (irq >= 0) {
        this.cpu_set_irq(1);
    } else {
        this.cpu_set_irq(0);
    }
};
PIC_Controller.prototype.set_irq = function(irq, Qf) {
    this.pics[irq >> 3].set_irq1(irq & 7, Qf);
    this.update_irq();
};
PIC_Controller.prototype.get_hard_intno = function() {
    var irq, slave_irq, intno;
    irq = this.pics[0].get_irq();
    if (irq >= 0) {
        this.pics[0].intack(irq);
        if (irq == 2) { //IRQ 2 cascaded to slave 8259 INT line in PC/AT
            slave_irq = this.pics[1].get_irq();
            if (slave_irq >= 0) {
                this.pics[1].intack(slave_irq);
            } else {
                slave_irq = 7;
            }
            intno = this.pics[1].irq_base + slave_irq;
            irq = slave_irq + 8;
        } else {
            intno = this.pics[0].irq_base + irq;
        }
    } else {
        irq = 7;
        intno = this.pics[0].irq_base + irq;
    }
    this.update_irq();
    return intno;
};

/* Serial Controller Emulator */

function Serial(Ng, mem8_loc, kh, lh) {
    this.divider = 0;
    this.rbr = 0;
    this.ier = 0;
    this.iir = 0x01;
    this.lcr = 0;
    this.mcr;
    this.lsr = 0x40 | 0x20;
    this.msr = 0;
    this.scr = 0;
    this.set_irq_func = kh;
    this.write_func = lh;
    this.receive_fifo = "";
    Ng.register_ioport_write(0x3f8, 8, 1, this.ioport_write.bind(this));
    Ng.register_ioport_read(0x3f8, 8, 1, this.ioport_read.bind(this));
}
Serial.prototype.update_irq = function() {
    if ((this.lsr & 0x01) && (this.ier & 0x01)) {
        this.iir = 0x04;
    } else if ((this.lsr & 0x20) && (this.ier & 0x02)) {
        this.iir = 0x02;
    } else {
        this.iir = 0x01;
    }
    if (this.iir != 0x01) {
        this.set_irq_func(1);
    } else {
        this.set_irq_func(0);
    }
};
Serial.prototype.ioport_write = function(mem8_loc, x) {
    mem8_loc &= 7;
    switch (mem8_loc) {
        default:
        case 0:
            if (this.lcr & 0x80) {
                this.divider = (this.divider & 0xff00) | x;
            } else {
                this.lsr &= ~0x20;
                this.update_irq();
                this.write_func(String.fromCharCode(x));
                this.lsr |= 0x20;
                this.lsr |= 0x40;
                this.update_irq();
            }
            break;
        case 1:
            if (this.lcr & 0x80) {
                this.divider = (this.divider & 0x00ff) | (x << 8);
            } else {
                this.ier = x;
                this.update_irq();
            }
            break;
        case 2:
            break;
        case 3:
            this.lcr = x;
            break;
        case 4:
            this.mcr = x;
            break;
        case 5:
            break;
        case 6:
            this.msr = x;
            break;
        case 7:
            this.scr = x;
            break;
    }
};
Serial.prototype.ioport_read = function(mem8_loc) {
    var Pg;
    mem8_loc &= 7;
    switch (mem8_loc) {
        default:
        case 0:
            if (this.lcr & 0x80) {
                Pg = this.divider & 0xff;
            } else {
                Pg = this.rbr;
                this.lsr &= ~(0x01 | 0x10);
                this.update_irq();
                this.send_char_from_fifo();
            }
            break;
        case 1:
            if (this.lcr & 0x80) {
                Pg = (this.divider >> 8) & 0xff;
            } else {
                Pg = this.ier;
            }
            break;
        case 2:
            Pg = this.iir;
            break;
        case 3:
            Pg = this.lcr;
            break;
        case 4:
            Pg = this.mcr;
            break;
        case 5:
            Pg = this.lsr;
            break;
        case 6:
            Pg = this.msr;
            break;
        case 7:
            Pg = this.scr;
            break;
    }
    return Pg;
};
Serial.prototype.send_break = function() {
    this.rbr = 0;
    this.lsr |= 0x10 | 0x01;
    this.update_irq();
};
Serial.prototype.send_char = function(mh) {
    this.rbr = mh;
    this.lsr |= 0x01;
    this.update_irq();
};
Serial.prototype.send_char_from_fifo = function() {
    var nh;
    nh = this.receive_fifo;
    if (nh != "" && !(this.lsr & 0x01)) {
        this.send_char(nh.charCodeAt(0));
        this.receive_fifo = nh.substr(1, nh.length - 1);
    }
};
Serial.prototype.send_chars = function(na) {
    this.receive_fifo += na;
    this.send_char_from_fifo();
};

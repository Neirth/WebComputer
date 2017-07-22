## WebComputer: What is this Project? 
It is project is desinged to emulates a PC with Intel Pentium MMX Processor in a single Webpage

## How to execute these project?
Easy, you can [click here](https://lordsergio.github.io/WebComputer/) to open the new windows on you do can execute these project

Also, you can fork the project in the own account of Github.

## What the specifications execute virtual machine?
The specifications what can run these machines is:
Speed Processor: No defined (Theoretically runs in 233MHz, but possibly run more than) 

>  **Number of VCPUS**: 1
>
>  **Memory RAM**:  14104 kB
>
>  **Kernel Running**: 2.6.20 
>
>  **Chroot Running**: buildbot (Pending to equip a most-used linux distribution)

## Why created these project?
It is one of my first projects in a computing world, these project is a mod of other [project](https://vfsync.org/index.html), the intention for fork these project is investigate how it worked a X86-Instructions in a Web Browser... 

## How to Work these project to emulate a X86 Complete Machine?
Basically what this project does is to use the X86 calls and make a binary translation to Javascript instructions for rendering to the host processor...

For emulate the RAM Space, the project reserve a space for the RAM Host, and loads it the bootloader, the Linux Kernel and the ramdisk for buildroot to interact with the Virtual Machine

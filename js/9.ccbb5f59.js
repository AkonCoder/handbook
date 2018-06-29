(window.webpackJsonp=window.webpackJsonp||[]).push([[9],{527:function(n,e){n.exports="\x3c!--\ntitle: KVM\nsort: 2\n--\x3e\n\n![](img/kvmbanner-logo3.png)\n\nCentOS7安装KVM虚拟机详解，基于 CentOS Linux release 7.2.1511 (Core) 的环境下命令行的方式安装KVM的详细过程。\n\n\n## 检测是否支持KVM\n\nKVM 是基于 x86 虚拟化扩展(Intel VT 或者 AMD-V) 技术的虚拟机软件，所以查看 CPU 是否支持 VT 技术，就可以判断是否支持KVM。有返回结果，如果结果中有vmx（Intel）或svm(AMD)字样，就说明CPU的支持的。\n\n```bash\ncat /proc/cpuinfo | egrep 'vmx|svm'\n\nflags   : fpu vme de pse tsc msr pae mce cx8 apic sep mtrr pge mca cmov pat pse36 clflush dts acpi mmx fxsr sse sse2 ss ht tm pbe syscall nx pdpe1gb rdtscp lm constant_tsc arch_perfmon pebs bts rep_good nopl xtopology nonstop_tsc aperfmperf eagerfpu pni pclmulqdq dtes64 monitor ds_cpl vmx smx est tm2 ssse3 fma cx16 xtpr pdcm pcid dca sse4_1 sse4_2 x2apic movbe popcnt tsc_deadline_timer aes xsave avx f16c rdrand lahf_lm abm arat epb pln pts dtherm tpr_shadow vnmi flexpriority ept vpid fsgsbase tsc_adjust bmi1 avx2 smep bmi2 erms invpcid cqm xsaveopt cqm_llc cqm_occup_llc\n```\n\n\n关闭SELinux，将 /etc/sysconfig/selinux 中的 `SELinux=enforcing` 修改为 `SELinux=disabled`\n\n```bash\nvi /etc/sysconfig/selinux\n```\n\n## 安装 KVM 环境\n \n通过 [yum](https://jaywcjlove.github.io/linux-command/c/yum.html) 安装 kvm 基础包和管理工具\n\nkvm相关安装包及其作用: \n\n- `qemu-kvm` 主要的KVM程序包  \n- `python-virtinst` 创建虚拟机所需要的命令行工具和程序库  \n- `virt-manager` GUI虚拟机管理工具  \n- `virt-top` 虚拟机统计命令  \n- `virt-viewer` GUI连接程序，连接到已配置好的虚拟机  \n- `libvirt` C语言工具包，提供libvirt服务  \n- `libvirt-client` 为虚拟客户机提供的C语言工具包  \n- `virt-install` 基于libvirt服务的虚拟机创建命令  \n- `bridge-utils` 创建和管理桥接设备的工具  \n\n```bash\n# 安装 kvm \n# ------------------------\n# yum -y install qemu-kvm python-virtinst libvirt libvirt-python virt-manager libguestfs-tools bridge-utils virt-install\n\nyum -y install qemu-kvm libvirt virt-install bridge-utils \n\n# 重启宿主机，以便加载 kvm 模块\n# ------------------------\nreboot\n\n# 查看KVM模块是否被正确加载\n# ------------------------\nlsmod | grep kvm\n\nkvm_intel             162153  0\nkvm                   525259  1 kvm_intel\n\n```\n\n开启kvm服务，并且设置其开机自动启动\n\n```bash\nsystemctl start libvirtd\nsystemctl enable libvirtd\n```\n\n查看状态操作结果，如`Active: active (running)`，说明运行情况良好\n\n```bash\nsystemctl status libvirtd\nsystemctl is-enabled libvirtd\n\n● libvirtd.service - Virtualization daemon\n   Loaded: loaded (/usr/lib/systemd/system/libvirtd.service; enabled; vendor preset: enabled)\n   Active: active (running) since 二 2001-01-02 11:29:53 CST; 1h 41min ago\n     Docs: man:libvirtd(8)\n           http://libvirt.org\n```\n\n## 安装虚拟机\n\n安装前要设置环境语言为英文`LANG=\"en_US.UTF-8\"`，如果是中文的话某些版本可能会报错。`CentOS 7` 在这里修改 `/etc/locale.conf`。\n\nkvm创建虚拟机，特别注意`.iso`镜像文件一定放到`/home` 或者根目录重新创建目录，不然会因为权限报错，无法创建虚拟机。\n\n```bash\nvirt-install \\\n--virt-type=kvm \\\n--name=centos78 \\\n--vcpus=2 \\\n--memory=4096 \\\n--location=/tmp/CentOS-7-x86_64-Minimal-1511.iso \\\n--disk path=/home/vms/centos78.qcow2,size=40,format=qcow2 \\\n--network bridge=br0 \\\n--graphics none \\\n--extra-args='console=ttyS0' \\\n--force\n# ------------------------\nvirt-install --virt-type=kvm --name=centos88 --vcpus=2 --memory=4096 --location=/tmp/CentOS-7-x86_64-Minimal-1511.iso --disk path=/home/vms/centos88.qcow2,size=40,format=qcow2 --network bridge=br0 --graphics none --extra-args='console=ttyS0' --force\n```\n\n### 命令行配置系统\n\n上面创建虚拟机命令最终需要你配置系统基础设置，带 `[!]` 基本都是要配置的，按照顺序往下配置，按对用的数字以此进行设置。\n\n```bash\n\nInstallation\n\n 1) [x] Language settings                 2) [!] Timezone settings\n        (English (United States))                (Timezone is not set.)\n 3) [!] Installation source               4) [!] Software selection\n        (Processing...)                          (Processing...)\n 5) [!] Installation Destination          6) [x] Kdump\n        (No disks selected)                      (Kdump is enabled)\n 7) [ ] Network configuration             8) [!] Root password\n        (Not connected)                          (Password is not set.)\n 9) [!] User creation\n        (No user will be created)\n  Please make your choice from above ['q' to quit | 'b' to begin installation |\n  'r' to refresh]:\n```\n\n2) Timezone settings 时区设置选择  `5) Asia亚洲`，再选择城市 `62) Shanghai上海`\n\n```bash\nAvailable regions\n 1)  Africa                 6)  Atlantic              10)  Pacific\n 2)  America                7)  Australia             11)  US\n 3)  Antarctica             8)  Europe                12)  Etc\n 4)  Arctic                 9)  Indian\n 5)  Asia\nPlease select the timezone.\nUse numbers or type names directly [b to region list, q to quit]: 5\n--------------------\n\n 8)  Baghdad               35)  Kathmandu             61)  Seoul\n 9)  Bahrain               36)  Khandyga              62)  Shanghai\n10)  Baku                  37)  Kolkata               63)  Singapore\n26)  Hong_Kong             53)  Pontianak\n27)  Hovd\nPlease select the timezone.\nUse numbers or type names directly [b to region list, q to quit]: 62\n\n```\n\n3) Installation source 安装源输入数字`2`\n\n```bash\nChoose an installation source type.\n 1)  CD/DVD\n 2)  local ISO file\n 3)  Network\n  Please make your choice from above ['q' to quit | 'c' to continue |\n  'r' to refresh]: 2\n```\n\n4) Software selection 软件选择\n\n```bash\nBase environment\nSoftware selection\n\nBase environment\n\n 1)  [x] Minimal Install\n  Please make your choice from above ['q' to quit | 'c' to continue |\n  'r' to refresh]:\n```\n\n5) Installation Destination 安装目的地\n\n```bash\nInstallation Destination\n\n[x] 1) : 40 GiB (vda)\n\n1 disk selected; 40 GiB capacity; 40 GiB free ...\n\n  Please make your choice from above ['q' to quit | 'c' to continue |\n  'r' to refresh]: c\n\n\nAutopartitioning Options 自动分区选项\n\n[ ] 1) Replace Existing Linux system(s) 替换现有的Linux系统\n\n[x] 2) Use All Space 使用所有空间\n\n[ ] 3) Use Free Space 使用可用空间\n\n================================================================================\nPartition Scheme Options 分区方案选项\n\n[ ] 1) Standard Partition 标准分区\n\n[ ] 2) Btrfs Btrfs\n\n[x] 3) LVM LVM(逻辑卷管理)\n\n[ ] 4) LVM Thin Provisioning 精简配置\n\nSelect a partition scheme configuration.\n\n  Please make your choice from above ['q' to quit | 'c' to continue |\n  'r' to refresh]: c\n\n```\n\n此处也可以只设置 `Root 密码`和`Installation Destination 安装目的地`其它进入系统设置比如时区设置如下：\n\n```bash\necho \"TZ='Asia/Shanghai'; export TZ\" >> /etc/profile\n```\n\n### 连接虚拟机\n\n通过 `virsh console <虚拟机名称>` 命令来连接虚拟机\n\n```bash\n# 查看虚拟机\nvirsh list              # 查看在运行的虚拟机\nvirsh list --all         # 查看所有虚拟机\n\n Id    Name                           State\n----------------------------------------------------\n 7     centos72                       running\n```\n\n连接虚拟机\n\n```bash\nvirsh console centos72\n```\n\n配置虚拟机网络，编辑`vi /etc/sysconfig/network-scripts/ifcfg-eth0`\n\n```bash\nTYPE=Ethernet\nBOOTPROTO=static\nIPADDR=192.168.120.200\nPREFIX=24\nGATEWAY=192.168.120.1\nDEFROUTE=yes\nPEERDNS=yes\nPEERROUTES=yes\nIPV4_FAILURE_FATAL=no\nIPV6INIT=yes\nIPV6_AUTOCONF=yes\nIPV6_DEFROUTE=yes\nIPV6_PEERDNS=yes\nIPV6_PEERROUTES=yes\nIPV6_FAILURE_FATAL=no\nNAME=eth0\nUUID=adfa3b7d-bf60-47e6-8482-871dee686fb5\nDEVICE=eth0\nONBOOT=yes\n```\n\n添加DNS配置，也可以放到`ifcfg-eth0`中，DNS不是随便设置的，你可以通过[host](https://jaywcjlove.github.io/linux-command/c/host.html)、[dig](https://jaywcjlove.github.io/linux-command/c/dig.html)、[nslookup](https://jaywcjlove.github.io/linux-command/c/nslookup.html)命令查询DNS，如果这些工具不存在可以通过`yum install bind-utils -y`来安装一下。\n\n```bash\n# 如果没有在网络配置添加DNS可以这种方式添加DNS\necho \"nameserver 192.168.188.1\" > /etc/resolv.conf\n```\n\n激活网卡\n\n```bash\nifup eth0 # 激活网卡\n```\n\n### 虚拟机其它管理\n\n```bash\nvirsh start centos72     # 虚拟机开启（启动）：\nvirsh reboot centos72    # 虚拟机重新启动\nvirsh shutdown centos72  # 虚拟机关机\nvirsh destroy centos72   # 强制关机（强制断电）\nvirsh suspend centos72   # 暂停（挂起）KVM 虚拟机\nvirsh resume centos72    # 恢复被挂起的 KVM 虚拟机\nvirsh undefine centos72  # 该方法只删除配置文件，磁盘文件未删除\nvirsh autostart centos72 # 随物理机启动而启动（开机启动）\nvirsh autostart --disable centos72 # 取消标记为自动开始（取消开机启动）\n```\n\n## 配置物理机网络\n\n目前我只有一个固定IP，通过配置`eno2`，网桥当做路由器，虚拟机共享物理机进出网络。物理机网络配置，网络进出走`eno2` 编辑`vi /etc/sysconfig/network-scripts/ifcfg-eno2`\n\n```bash\nTYPE=Ethernet\nBOOTPROTO=static\nDEFROUTE=yes\nPEERDNS=yes\nPEERROUTES=yes\nIPV4_FAILURE_FATAL=no\nIPV6INIT=yes\nIPV6_AUTOCONF=yes\nIPV6_DEFROUTE=yes\nIPV6_PEERDNS=yes\nIPV6_PEERROUTES=yes\nIPV6_FAILURE_FATAL=no\nNAME=eno2\nUUID=f66c303e-994a-43cf-bd91-bb897dc2088d\nDEVICE=eno2\nONBOOT=yes\n\nIPADDR=<这里固定IP配置的地方>  # 设置IP地址\nPREFIX=24                   # 设置子网掩码\nGATEWAY=<这里设置网关>        # 设置网关\nDNS1=<这里设置DNS>           # DNS\n```\n\n`ifcfg-br0` 桥接网卡配置在同一个目录中。\n\n```bash\nTYPE=Bridge\nBOOTPROTO=static\nNAME=br0\nDEVICE=br0\nONBOOT=yes\nIPADDR=192.168.120.1\nPREFIX=24\n```\n\n`ifcfg-eno1` 物理网卡指定桥接网卡`BRIDGE=\"br0\"`\n\n```bash\nTYPE=Ethernet\nBOOTPROTO=none\nNAME=eno1\nDEVICE=eno1\nONBOOT=yes\nBRIDGE=\"br0\"\n```\n\n配置路由转发`vi /etc/sysctl.conf`\n\n```bash\n# Controls IP packet forwarding\nnet.ipv4.ip_forward = 0\n修改为\n# Controls IP packet forwarding\nnet.ipv4.ip_forward = 1    允许内置路由\n```\n\n再执行 `sysctl -p` 使其生效\n\n## 端口转发\n\n现在我们还以上述VM为例，目前该KVM的公网IP为`211.11.61.7`，VM的IP为`192.168.188.115`，现在我要求通过访问KVM的2222端口访问VM的22端口。\n\n编辑`vi /etc/rc.d/rc.local` 添加下面命令，达到开机重启配置网络转发规则。\n\n```bash\n# 启动网络转发规则\niptables -t nat -A : -s 192.168.188.0/24 -j SNAT --to-source 211.11.61.7\n\niptables -t nat -A POSTROUTING -s 192.168.188.0/24 -j SNAT --to-source 211.11.61.7\niptables -t nat -A PREROUTING -d  211.11.61.7 -p tcp --dport 2222  -j DNAT --to-dest 192.168.188.115:22\niptables -t nat -A PREROUTING -d  211.11.61.7 -p tcp --dport 2221  -j DNAT --to-dest 192.168.188.115:21\n\n# 实际效果可以通过外网连接虚拟机\nssh -p 2222 root@211.11.61.7\n```\n\n通过[iptables](https://jaywcjlove.github.io/linux-command/c/iptables.html)命令来设置转发规则，源SNAT规则，源网络地址转换，SNAT就是重写包的源IP地址。\n\n```bash\n# 数据包进行 源NAT(SNAT)，系统先路由——>再过滤（FORWARD)——>最后才进行POSTROUTING SNAT地址翻译\n# -t<表>：指定要操纵的表；\n# -A：向规则链中添加条目；\n# -s：指定要匹配的数据包源ip地址；\n# -j<目标>：指定要跳转的目标；\n# -j SNAT：源网络地址转换，SNAT就是重写包的源IP地址\n# --to-source ipaddr[-ipaddr][:port-port] \n#   它可以指定单个新的源IP地址，IP地址的包含范围，以及可选的端口范围（仅当规则还指定-p tcp或-p udp时才有效）。 \n#   如果没有指定端口范围，则低于512的源端口将映射到512以下的其他端口：512和1023之间的端口将映射到低于1024的端口，\n#   其他端口将被映射到1024或更高。 在可能的情况下，不会发生港口更改。\n#   在内核高达2.6.10，您可以添加几个 - 源选项。 \n#   对于这些内核，如果通过地址范围或多个源选项指定多个源地址，则会在这些地址之间进行简单的循环（循环中循环）。 \n#   后来的内核（> = 2.6.11-rc1）不再具有NAT到多个范围的能力。\niptables -t nat -A POSTROUTING -s 192.168.120.0/24 -j SNAT --to-source <固定IP>\n# cat /etc/sysconfig/iptables\n```\n\n## 公网访问虚拟机\n\n通过公网ip `192.168.188.222`端口`2280`，转发到虚拟机`192.168.111.133:80`上面\n\n```bash\niptables -t nat -A PREROUTING -d 192.168.188.222 -p tcp --dport 2280 -j DNAT --to-dest 192.168.111.133:80\n```\n\n重启并保存 `iptables` 配置。\n\n```bash\n# 保存 \nservice iptables save\n# 重启\nservice iptables restart\n```\n\n## 配置宿主机网络\n\n1. KVM 虚拟机是基于 NAT 的网络配置；\n2. 只有同一宿主机的虚拟键之间可以互相访问，跨宿主机是不能访问；\n3. 虚拟机需要和宿主机配置成桥接模式，以便虚拟机可以在局域网内可见；\n\n### Bridge模式配置\n\nBridge方式即虚拟网桥的网络连接方式，是客户机和子网里面的机器能够互相通信。可以使虚拟机成为网络中具有独立IP的主机。**桥接网络**（也叫 **物理设备共享**）被用作把一个物理设备复制到一台虚拟机。网桥多用作高级设置，特别是主机多个网络接口的情况。\n\n```bash\n┌─────────────────────────┐      ┌─────────────────┐\n│          HOST           │      │Virtual Machine 1│\n│ ┌──────┐      ┌───────┐ │      │    ┌──────┐     │\n│ │ br0  │──┬───│ vnet0 │─│─ ─ ─ │    │ br0  │     │\n│ └──────┘  │   └───────┘ │      │    └──────┘     │\n│     │     │             │      └─────────────────┘\n│     │     │   ┌───────┐ │      ┌─────────────────┐\n│ ┌──────┐  └───│ vnet1 │─│─     │Virtual Machine 2│\n│ │ eno0 │      └───────┘ │ │    │    ┌──────┐     │\n│ └──────┘                │  ─ ─ │    │ br0  │     │\n│ ┌──────┐                │      │    └──────┘     │\n│ │ eno1 │                │      └─────────────────┘\n│ └──────┘                │\n└─────────────────────────┘\n```\n\n通过[ip](https://jaywcjlove.github.io/linux-command/c/ip.html) 命令查看宿主机配置文件的名字\n\n```bash\nip addr\n\n6: eno1: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc mq state UP qlen 1000\n    link/ether 38:63:bb:44:cf:6c brd ff:ff:ff:ff:ff:ff\n    inet 192.168.188.132/24 brd 192.168.188.255 scope global dynamic eno1\n       valid_lft 2822sec preferred_lft 2822sec\n    inet6 fe80::3a63:bbff:fe44:cf6c/64 scope link\n       valid_lft forever preferred_lft forever\n```\n\n可以看到上面`eno1`是有获取到ip地址的，相对应的文件在`/etc/sysconfig/network-scripts/`目录中，`ifcfg-eno1` 宿主机的物理网卡配置文件\n\n```bash\n# cat ifcfg-eno1\nTYPE=Ethernet\nBOOTPROTO=static\nNAME=eno1\nDEVICE=eno1\nUUID=242b3d4d-37a5-4f46-b072-55554c185ecf\nONBOOT=yes\n\nBRIDGE=\"br0\" # 指定桥接网卡的名称\n```\n\n`ifcfg-br0` 桥接网卡配置在同一个目录中。\n\n```bash\n# cat ifcfg-br0\nBOOTPROTO=static\nDEFROUTE=yes\nPEERDNS=yes\nPEERROUTES=yes\nIPV4_FAILURE_FATAL=no\nIPV6INIT=yes\nIPV6_AUTOCONF=yes\nIPV6_DEFROUTE=yes\nIPV6_PEERDNS=yes\nIPV6_PEERROUTES=yes\nIPV6_FAILURE_FATAL=no\nNAME=br0\nUUID=242b3d4d-37a5-4f46-b072-55554c185ecf\nDEVICE=br0\nONBOOT=yes\nTYPE=bridge  # 将制定为桥接类型\nIPADDR=192.168.188.133  # 设置IP地址\nPREFIX=24               # 设置子网掩码\nGATEWAY=192.168.188.1   # 设置网关\n```\n\n配置好之后，通过[systemctl](https://jaywcjlove.github.io/linux-command/c/systemctl.html) 命令重启网卡。\n\n```bash\nifup eno1 # 激活网卡\nifup br0 # 激活桥接网卡\n# 两种重启网络的方法\nsystemctl restart network.service\nservice network restart\n\n# 校验桥接接口\nbrctl show\n\nbridge name bridge id   STP enabled interfaces\nbr0   8000.3863bb44cf6c no    eno1\n              vnet0\nvirbr0    8000.525400193f0f yes   virbr0-nic\n```\n\n\n### NAT模式\n\nNAT(Network Address Translation网络地址翻译)，NAT方式是kvm安装后的默认方式。它支持主机与虚拟机的互访，同时也支持虚拟机访问互联网，但不支持外界访问虚拟机。\n\n```bash\nvirsh net-edit default # 如果要创建或者修改NAT网络，要先编辑default.xml：\nvirsh net-list --all\n\n Name                 State      Autostart     Persistent\n----------------------------------------------------------\n default              active     no            no\n```\n\ndefault是宿主机安装虚拟机支持模块的时候自动安装的。\n\n```bash\nip a l\n1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN\n    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00\n    inet 127.0.0.1/8 scope host lo\n       valid_lft forever preferred_lft forever\n    inet6 ::1/128 scope host\n       valid_lft forever preferred_lft forever\n2: ens1f0: <BROADCAST,MULTICAST> mtu 1500 qdisc mq state DOWN qlen 1000\n    link/ether 2c:44:fd:8c:43:44 brd ff:ff:ff:ff:ff:ff\n3: ens1f1: <BROADCAST,MULTICAST> mtu 1500 qdisc mq state DOWN qlen 1000\n    link/ether 2c:44:fd:8c:43:45 brd ff:ff:ff:ff:ff:ff\n4: ens1f2: <BROADCAST,MULTICAST> mtu 1500 qdisc mq state DOWN qlen 1000\n    link/ether 2c:44:fd:8c:43:46 brd ff:ff:ff:ff:ff:ff\n5: ens1f3: <BROADCAST,MULTICAST> mtu 1500 qdisc mq state DOWN qlen 1000\n    link/ether 2c:44:fd:8c:43:47 brd ff:ff:ff:ff:ff:ff\n6: eno1: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc mq master br0 state UP qlen 1000\n    link/ether 38:63:bb:44:cf:6c brd ff:ff:ff:ff:ff:ff\n7: eno2: <BROADCAST,MULTICAST> mtu 1500 qdisc mq state DOWN qlen 1000\n    link/ether 38:63:bb:44:cf:6d brd ff:ff:ff:ff:ff:ff\n8: eno3: <BROADCAST,MULTICAST> mtu 1500 qdisc mq state DOWN qlen 1000\n    link/ether 38:63:bb:44:cf:6e brd ff:ff:ff:ff:ff:ff\n9: eno4: <BROADCAST,MULTICAST> mtu 1500 qdisc mq state DOWN qlen 1000\n    link/ether 38:63:bb:44:cf:6f brd ff:ff:ff:ff:ff:ff\n10: virbr0: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc noqueue state DOWN\n    link/ether 52:54:00:19:3f:0f brd ff:ff:ff:ff:ff:ff\n    inet 192.168.122.1/24 brd 192.168.122.255 scope global virbr0\n       valid_lft forever preferred_lft forever\n11: virbr0-nic: <BROADCAST,MULTICAST> mtu 1500 qdisc pfifo_fast master virbr0 state DOWN qlen 500\n    link/ether 52:54:00:19:3f:0f brd ff:ff:ff:ff:ff:ff\n12: br0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP\n    link/ether 38:63:bb:44:cf:6c brd ff:ff:ff:ff:ff:ff\n    inet 192.168.188.132/24 brd 192.168.188.255 scope global dynamic br0\n       valid_lft 3397sec preferred_lft 3397sec\n    inet 192.168.188.133/24 brd 192.168.188.255 scope global secondary br0\n       valid_lft forever preferred_lft forever\n    inet6 fe80::3a63:bbff:fe44:cf6c/64 scope link\n       valid_lft forever preferred_lft forever\n19: vnet0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast master br0 state UNKNOWN qlen 500\n    link/ether fe:54:00:72:12:a8 brd ff:ff:ff:ff:ff:ff\n    inet6 fe80::fc54:ff:fe72:12a8/64 scope link\n       valid_lft forever preferred_lft forever\n```\n\n其中virbr0是由宿主机虚拟机支持模块安装时产生的虚拟网络接口，也是一个switch和bridge，负责把内容分发到各虚拟机。几个虚拟机管理模块产生的接口关系如下图:\n\n```bash\n┌───────────────────────┐                      \n│         HOST          │                      \n│ ┌──────┐              │   ┌─────────────────┐\n│ │ br0  │─┬──────┐     │   │Virtual Machine 1│\n│ └──────┘ │      │     │   │   ┌──────┐      │\n│     │    │  ┌───────┐ │ ─ │   │ br0  │      │\n│     │    │  │ vnet0 │─│┘  │   └──────┘      │\n│ ┌──────┐ │  └───────┘ │   └─────────────────┘\n│ │virbr0│ │  ┌───────┐ │   ┌─────────────────┐\n│ │ -nic │ └──│ vnet1 │─│┐  │Virtual Machine 2│\n│ └──────┘    └───────┘ │   │                 │\n│ ┌──────┐              │└ ─│   ┌──────┐      │\n│ │ eno0 │              │   │   │ br0  │      │\n│ └──────┘              │   │   └──────┘      │\n│ ┌──────┐              │   └─────────────────┘\n│ │ eno1 │              │\n│ └──────┘              │\n└───────────────────────┘\n```\n\n从图上可以看出，虚拟接口和物理接口之间没有连接关系，所以虚拟机只能在通过虚拟的网络访问外部世界，无法从网络上定位和访问虚拟主机。\n\nvirbr0是一个桥接器，接收所有到网络192.168.122.*的内容。从下面命令可以验证：\n\n```bash\nbrctl show\n# 输出结果\n# ---------------------\n# bridge name bridge id   STP enabled interfaces\n# br0   8000.3863bb44cf6c no    eno1\n#               vnet0\n# virbr0    8000.525400193f0f yes   virbr0-nic\n\nip route\n# default via 192.168.188.1 dev br0\n# 169.254.0.0/16 dev br0  scope link  metric 1012\n# 192.168.122.0/24 dev virbr0  proto kernel  scope link  src 192.168.122.1\n# 192.168.188.0/24 dev br0  proto kernel  scope link  src 192.168.188.132\n```\n\n同时，虚拟机支持模块会修改iptables规则，通过命令可以查看：\n\n```bash\niptables -t nat -L -nv\niptables -t filter -L -nv\n```\n\n如果没有default的话，或者需要扩展自己的虚拟网络，可以使用命令重新安装NAT。\n\n```bash\nvirsh net-define /usr/share/libvirt/networks/default.xml\n```\n\n此命令定义一个虚拟网络，default.xml的内容：\n\n```html\n<network>\n  <name>default</name>\n  <bridge name=\"virbr0\" />\n  <forward/>\n  <ip address=\"192.168.122.1\" netmask=\"255.255.255.0\">\n    <dhcp>\n      <range start=\"192.168.122.2\" end=\"192.168.122.254\" />\n    </dhcp>\n  </ip>\n</network>\n```\n\n也可以修改xml，创建自己的虚拟网络。\n\n重新加载和激活配置：\n\n```bash\nvirsh  net-define /etc/libvirt/qemu/networks/default.xml\n```\n\n标记为自动启动：\n\n```bash\nvirsh net-autostart default\n# Network default marked as autostarted\n\nvirsh net-start default\n```\n\n启动网络：\n\n```bash\nvirsh net-start default\n# Network default started\n```\n\n网络启动后可以用命令brctl show 查看和验证。\n\n修改`vi /etc/sysctl.conf`中参数，允许ip转发，CentOS7是在`vi /usr/lib/sysctl.d/00-system.conf` 这里面修改\n\n```bash\nnet.ipv4.ip_forward=1\n```\n\n通过 `sysctl -p` 查看修改结果\n\n\n### 自定义NAT网络\n\n创建名为`management`的NAT网络，`vi  /usr/share/libvirt/networks/management.xml`\n\n```html\n<network>\n  <name>management</name>\n  <bridge name=\"virbr1\"/>\n  <forward/>\n  <ip address=\"192.168.123.1\" netmask=\"255.255.255.0\">\n    <dhcp>\n      <range start=\"192.168.123.2\" end=\"192.168.123.254\"/>\n    </dhcp>\n  </ip>\n</network>\n```\n\n启用新建的NAT网络\n\n```bash\nvirsh net-define /usr/share/libvirt/networks/management.xml\nvirsh net-start management\nvirsh net-autostart management\n```\n\n验证\n\n```bash\nbrctl show\n# bridge name bridge id   STP enabled interfaces\n# br0   8000.3863bb44cf6c no    eno1\n#               vnet0\n# virbr0    8000.525400193f0f yes   virbr0-nic\n# virbr1    8000.52540027f0ba yes   virbr1-nic\n\nvirsh net-list --all\n#  Name                 State      Autostart     Persistent\n# ----------------------------------------------------------\n#  default              active     no            no\n#  management           active     yes           yes\n```\n\n### 退出虚拟机\n\n```bash\nexit # 退出系统到登录界面\n\nCtrl+5 # 从虚拟机登录页面，退出到宿主机命令行页面\nCtrl+] # 或者下面\n```\n\n## 修改虚拟机配置信息\n\n直接通过vim命令修改\n\n```bash\nvim  /etc/libvirt/qemu/centos72.xml\n```\n\n通过virsh命令修改\n\n```bash\nvirsh edit centos72\n```\n\n## 克隆虚拟机\n\n```bash\n# 暂停原始虚拟机\nvirsh shutdown centos72\nvirt-clone -o centos72 -n centos.112 -f /home/vms/centos.112.qcow2 -m 00:00:00:00:00:01\nvirt-clone -o centos88 -n centos.112 --file /home/vms/centos.112.qcow2 --nonsparse\n```\n\n`virt-clone` 参数介绍\n\n- `--version` 查看版本。\n- `-h，--help` 查看帮助信息。\n- `--connect=URI` 连接到虚拟机管理程序 libvirt 的URI。\n- `-o 原始虚拟机名称` 原始虚拟机名称，必须为关闭或者暂停状态。\n- `-n 新虚拟机名称` --name 新虚拟机名称。\n- `--auto-clone` 从原来的虚拟机配置自动生成克隆名称和存储路径。\n- `-u NEW_UUID, --uuid=NEW_UUID` 克隆虚拟机的新的UUID，默认值是一个随机生成的UUID。\n- `-m NEW_MAC, --mac=NEW_MAC` 设置一个新的mac地址，默认为随机生成 MAC。\n- `-f NEW_DISKFILE, --file=NEW_DISKFILE` 为新客户机使用新的磁盘镜像文件地址。\n- `--force-copy=TARGET` 强制复制设备。\n- `--nonsparse` 不使用稀疏文件复制磁盘映像。\n\n## 通过镜像创建虚拟机\n\n创建虚拟机镜像文件\n\n```bash\n# 复制第一次安装的干净系统镜像，作为基础镜像文件，\n# 后面创建虚拟机使用这个基础镜像\ncp /home/vms/centos.88.qcow2 /home/vms/centos7.base.qcow2\n\n# 使用基础镜像文件，创建新的虚拟机镜像\ncp /home/vms/centos7.base.qcow2 /home/vms/centos7.113.qcow2\n```\n\n创建虚拟机配置文件\n\n```bash\n# 复制第一次安装的干净系统镜像，作为基础配置文件。\nvirsh dumpxml centos.88 > /home/vms/centos7.base.xml\n\n# 使用基础虚拟机镜像配置文件，创建新的虚拟机配置文件\ncp /home/vms/centos7.base.xml /home/vms/centos7.113.xml\n\n# 编辑新虚拟机配置文件\nvi /home/vms/centos7.113.xml\n```\n\n主要是修改虚拟机文件名，UUID，镜像地址和网卡地址，其中 UUID 在 Linux 下可以使用 `uuidgen` 命令生成\n\n```html\n<domain type='kvm'>\n  <name>centos7.113</name>\n  <uuid>1e86167a-33a9-4ce8-929e-58013fbf9122</uuid>\n  <devices>\n    <disk type='file' device='disk'>\n      <source file='/home/vms/centos7.113.img'/>\n    </disk>\n    <interface type='bridge'>\n      <mac address='00:00:00:00:00:04'/>\n    </interface>    \n    </devices>\n</domain>\n```\n\n```bash\nvirsh define /home/vms/centos7.113.xml\n# Domain centos.113 defined from /home/vms/centos7.113.xml\n```\n\n## 动态更改cpu数量和内存大小\n\n动态调整，如果超过给虚拟机分配的最大内存，需要重启虚拟机。\n\n```bash\nvirsh list --all\n#  Id    名称                         状态\n# ----------------------------------------------------\n#  2     working112                     running\n\n# 更改CPU\nvirsh setvcpus working112 --maximum 4 --config\n# 更改内存\nvirsh setmaxmem working112 1048576 --config\n# 查看信息\nvirsh dominfo working112\n```\n\n## 挂载磁盘\n\n### 创建磁盘\n\n```bash\nmkdir /home/vms\n```\n\n查看镜像信息\n\n```bash\nvirt-filesystems --long --parts --blkdevs -h -a working112.qcow2\n\n# Name       Type       Size  Parent\n# /dev/sda1  partition  200M  /dev/sda\n# /dev/sda2  partition  9.8G  /dev/sda\n# /dev/sda   device     10G   -\n\nqemu-img info working112.qcow2\n\n# image: working112.qcow2\n# file format: qcow2\n# virtual size: 140G (150323855360 bytes)\n# disk size: 33G\n# cluster_size: 65536\n# Format specific information:\n#     compat: 1.1\n#     lazy refcounts: true\n```\n\n给虚拟机镜像添加`200G`大小，注意需要停止`working112`虚拟机\n\n```bash\nqemu-img resize working112.qcow2 +200G\n# Image resized.\n```\n\n首先，我们制作如下所示的磁盘的备份副本。\n\n```bash\ncp working112.qcow2 working112-orig.qcow2\n```\n\n然后我们运行下面的命令来增加 `/dev/sda`\n\n```bash\nvirt-resize --expand /dev/sda1 working112-orig.qcow2 working112.qcow2\n```\n\n查看镜像信息\n\n```bash\nqemu-img info working112.qcow2\n# image: working112.qcow2\n# file format: qcow2\n# virtual size: 140G (150323855360 bytes)\n# disk size: 33G\n# cluster_size: 65536\n# Format specific information:\n#     compat: 1.1\n#     lazy refcounts: true\n```\n\n进入虚拟机`virsh console working112` 查看信息：\n\n```bash\nvgdisplay # 显示卷组大小\nlvdisplay # 显示逻辑卷大小\n```\n\n卷组大小已增加，下面需要分配容量给逻辑卷\n\n```bash\nlvextend -L +60G /dev/centos/root\n```\n\n还有最后一步，分配好了需要做系统调整\n\n```bash\n# ext 系统格式使用：\nresize2fs /dev/centos/root\n# xfs 系统格式使用下面命令\nxfs_growfs /dev/centos/root\n```\n\n## 常用命令说明\n\n### virt-install \n\n常用参数说明\n\n```bash\n–name指定虚拟机名称\n–memory分配内存大小。\n–vcpus分配CPU核心数，最大与实体机CPU核心数相同\n–disk指定虚拟机镜像，size指定分配大小单位为G。\n–network网络类型，此处用的是默认，一般用的应该是bridge桥接。\n–accelerate加速\n–cdrom指定安装镜像iso\n–vnc启用VNC远程管理，一般安装系统都要启用。\n–vncport指定VNC监控端口，默认端口为5900，端口不能重复。\n–vnclisten指定VNC绑定IP，默认绑定127.0.0.1，这里改为0.0.0.0。\n–os-type=linux,windows\n–os-variant=rhel6\n\n--name      指定虚拟机名称\n--ram       虚拟机内存大小，以 MB 为单位\n--vcpus     分配CPU核心数，最大与实体机CPU核心数相同\n–-vnc       启用VNC远程管理，一般安装系统都要启用。\n–-vncport   指定VNC监控端口，默认端口为5900，端口不能重复。\n–-vnclisten  指定VNC绑定IP，默认绑定127.0.0.1，这里改为0.0.0.0。\n--network   虚拟机网络配置\n  # 其中子选项，bridge=br0 指定桥接网卡的名称。\n\n–os-type=linux,windows\n–os-variant=rhel7.2\n\n--disk 指定虚拟机的磁盘存储位置\n  # size，初始磁盘大小，以 GB 为单位。\n\n--location 指定安装介质路径，如光盘镜像的文件路径。\n--graphics 图形化显示配置\n  # 全新安装虚拟机过程中可能会有很多交互操作，比如设置语言，初始化 root 密码等等。\n  # graphics 选项的作用就是配置图形化的交互方式，可以使用 vnc（一种远程桌面软件）进行链接。\n  # 我们这列使用命令行的方式安装，所以这里要设置为 none，但要通过 --extra-args 选项指定终端信息，\n  # 这样才能将安装过程中的交互信息输出到当前控制台。\n--extra-args 根据不同的安装方式设置不同的额外选项\n```\n\n### virsh\n\n基础命令\n\n```bash\nvirsh list --all           # 查看所有运行和没有运行的虚拟机\nvirsh list                 # 查看在运行的虚拟机\nvirsh dumpxml vm-name      # 查看kvm虚拟机配置文件\nvirsh start vm-name        # 启动kvm虚拟机\nvirsh shutdown vm-name     # 正常关机\n\nvirsh destroy vm-name      # 非正常关机，强制关闭虚拟机（相当于物理机直接拔掉电源）\nvirsh undefine vm-name     # 删除vm的配置文件\n\nls /etc/libvirt/qemu\n# 查看删除结果，Centos-6.6的配置文件被删除，但磁盘文件不会被删除\n\nvirsh define file-name.xml # 根据配置文件定义虚拟机\nvirsh suspend vm-name      # 挂起，终止\nvirsh resumed vm-name      # 恢复被挂起的虚拟机\nvirsh autostart vm-name    # 开机自启动vm\nvirsh console <虚拟机名称>   # 连接虚拟机\n```\n\n## 错误解决\n\n```bash\nconsole test\nConnected to domain test\nEscape character is ^]\n```\n\n如果出现上面字符串使用 <kbd>CTRL+Shift+5</kbd> <kbd>CTRL+Shift+]</kbd>\n\n1. ERROR Format cannot be specified for unmanaged storage.\nvirt-manager 没有找到存储池，创建储存池即可\n\n2. KVM VNC客户端连接闪退\n使用real vnc或者其它vnc客户端连接kvm闪退，把客户端设置中的ColourLevel值设置为rgb222或full即可\n\n3. virsh shutdown <domain> 无法关闭虚拟机\n使用该命令关闭虚拟机时，KVM是向虚拟机发送一个ACPI的指令，需要虚拟机安装acpid服务：\n\n4. operation failed: Active console session exists for this domain\n\n```bash\n# 方案1\n$ ps aux | grep console\n$ kill -9 <进程号>\n# 方案2\n$ /etc/init.d/libvirt-bin restart\n# 方案3\n$ ps aux | grep kvm\n$ kill 对应的虚拟机进程\n```\n\n## 参考文章\n\n- [KVM官方网站](https://www.linux-kvm.org/page/Main_Page)\n- [KVM虚拟机Linux系统增加硬盘](http://www.cnblogs.com/ilanni/p/3878151.html)\n- [virt-install 命令参数详解](https://www.ibm.com/support/knowledgecenter/zh/linuxonibm/liaat/liaatvirtinstalloptions.htm)\n- [使用virt-install安装虚拟机，发行版安装代码直接复制运行](https://raymii.org/s/articles/virt-install_introduction_and_copy_paste_distro_install_commands.html)\n- [KVM Linux - Expanding a Guest LVM File System Using Virt-resize](http://blog.oneiroi.co.uk/linux/kvm/virt-resize/RHEL/LVM/kvm-linux-expanding-a-lvm-guest-file-system-using-virt-resize/)\n"}}]);
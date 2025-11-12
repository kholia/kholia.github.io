---
title: "Easy reproducible TX-BPF filters"
date: 2025-02-10
tags:
- RF Hacking
- HAM
- Amateur Radio
- BPF
- 25W
- TX-BPF
- RF filters
- Filters
- Elsie
- DE-5000
---

Some weeks back, we published our designs for building reproducible TX-BPF filters easily.

10m TX-BPF:

![TX-BPF render](/images/TX-BPF-Render.png)

Results of the `Dhiru's Manhattan` build:

![TX-BPF Manhattan build results](/images/TX-BPF-Demo.jpg)

Results of the PCB build:

![TX-BPF results](/images/PCB-Build-28.png)

![TX-BPF PCB build results](/images/TX-BPF-PCB-Demo.jpg)

While many amateur radio operators focus *solely* on antenna optimization, the significant benefits of TX-BPF filters are often overlooked or under-discussed in the hobby! Even with HOA antenna restrictions, you can still optimize your station's performance through proper TX-BPF filtering.

We have reduced the cost of such filters by using cost-effective 1kV SMD C0G caps instead of hard-to-get and "probably-obsolete" Silver Mica caps.

Cost: Less than 500 INR per filter!

Time to build: Less than 30 minutes per filter

Tested input power: 15W. They should go up to 25 to 30W.

Learning: [Elsie](https://tonnesoftware.com/elsie.html) works much better (produces realistic filters, enables interactive debugging) than Qucs Studio and [Marki Microwave Filter Design Tool](https://markimicrowave.com/technical-resources/tools/lc-filter-design-tool/). While we are not fans of proprietary software, we are forced to recommend Elsie - it is that good!

Special thanks go to [VU2SPF](https://vu2spf.blogspot.com/) for all his help!

export default function EvmDashboard() {
  return (
    <div className="space-y-6">
      <header className="rounded-2xl bg-white p-6 shadow">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">EVM Admin Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">Tổng quan điều hành: sản phẩm, phân phối, đại lý, giá & khuyến mãi</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">Tạo chính sách mới</button>
            <button className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-50">Xuất báo cáo</button>
          </div>
        </div>
      </header>

      {/* KPI Summary */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard label="Tồn kho tổng" value="1,284" sub="xe" trend="+3.4% MoM" trendUp />
        <KpiCard label="Đã phân bổ cho đại lý" value="932" sub="xe" trend="+1.2% MoM" trendUp />
        <KpiCard label="Đơn đặt chờ xử lý" value="128" sub="đơn" trend="-0.8% WoW" />
        <KpiCard label="Chương trình khuyến mãi" value="12" sub="đang hiệu lực" trend="2 kết thúc tuần này" />
        <KpiCard label="Số lượng đại lý" value="24" sub="active" trend="+1 mới" trendUp />
        <KpiCard label="Công nợ phải thu" value="38.2 tỷ" sub="VND" trend="+4.1% MoM" />
      </section>

      {/* Product & Distribution */}
      <section className="rounded-2xl bg-white p-6 shadow">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Danh mục sản phẩm & phân phối</h2>
            <p className="mt-1 text-sm text-gray-500">Quản lý mẫu, phiên bản, màu sắc và phân bổ cho đại lý</p>
          </div>
          <div className="flex gap-2">
            <button className="rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50">Nhập tồn kho</button>
            <button className="rounded-lg bg-black px-3 py-2 text-sm font-medium text-white hover:bg-gray-800">Thêm mẫu xe</button>
          </div>
        </div>
        <div className="mt-4 overflow-hidden rounded-xl border border-gray-100">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <Th>Model</Th>
                <Th>Phiên bản</Th>
                <Th>Màu</Th>
                <Th>Giá sỉ (VND)</Th>
                <Th>Tồn kho</Th>
                <Th>Đã phân bổ</Th>
                <Th>Hành động</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {PRODUCT_ROWS.map((r) => (
                <tr key={`${r.model}-${r.variant}-${r.color}`} className="hover:bg-gray-50/50">
                  <Td>{r.model}</Td>
                  <Td>{r.variant}</Td>
                  <Td>{r.color}</Td>
                  <Td>{r.wholesalePrice}</Td>
                  <Td><span className="font-medium">{r.stock}</span></Td>
                  <Td>{r.allocated}</Td>
                  <Td>
                    <div className="flex gap-2">
                      <button className="rounded-md border border-gray-200 px-3 py-1 text-xs hover:bg-gray-50">Phân bổ</button>
                      <button className="rounded-md border border-gray-200 px-3 py-1 text-xs hover:bg-gray-50">Điều phối</button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Dealer Management */}
      <section className="rounded-2xl bg-white p-6 shadow">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Quản lý đại lý</h2>
            <p className="mt-1 text-sm text-gray-500">Hợp đồng, chỉ tiêu doanh số, công nợ, trạng thái hoạt động</p>
          </div>
          <div className="flex gap-2">
            <button className="rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50">Nhập hợp đồng</button>
            <button className="rounded-lg bg-black px-3 py-2 text-sm font-medium text-white hover:bg-gray-800">Thêm đại lý</button>
          </div>
        </div>
        <div className="mt-4 overflow-hidden rounded-xl border border-gray-100">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <Th>Đại lý</Th>
                <Th>Khu vực</Th>
                <Th>Chỉ tiêu (tháng)</Th>
                <Th>Đã phân bổ</Th>
                <Th>Bán ra (MTD)</Th>
                <Th>Công nợ (VND)</Th>
                <Th>Trạng thái</Th>
                <Th>Hành động</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {DEALER_ROWS.map((r) => (
                <tr key={r.name} className="hover:bg-gray-50/50">
                  <Td className="font-medium">{r.name}</Td>
                  <Td>{r.region}</Td>
                  <Td>{r.quota}</Td>
                  <Td>{r.allocated}</Td>
                  <Td>{r.sales}</Td>
                  <Td>{r.receivables}</Td>
                  <Td>
                    <span className={
                      r.status === 'Active'
                        ? 'rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700'
                        : r.status === 'Watch'
                          ? 'rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700'
                          : 'rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600'
                    }>
                      {r.status}
                    </span>
                  </Td>
                  <Td>
                    <div className="flex gap-2">
                      <button className="rounded-md border border-gray-200 px-3 py-1 text-xs hover:bg-gray-50">Chỉ tiêu</button>
                      <button className="rounded-md border border-gray-200 px-3 py-1 text-xs hover:bg-gray-50">Công nợ</button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Pricing & Promotions */}
      <section className="rounded-2xl bg-white p-6 shadow">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Giá sỉ & khuyến mãi theo đại lý</h2>
            <p className="mt-1 text-sm text-gray-500">Theo dõi hiệu lực chương trình, phạm vi áp dụng và mức chiết khấu</p>
          </div>
          <div className="flex gap-2">
            <button className="rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50">Tải bảng giá</button>
            <button className="rounded-lg bg-black px-3 py-2 text-sm font-medium text-white hover:bg-gray-800">Tạo chương trình</button>
          </div>
        </div>
        <div className="mt-4 overflow-hidden rounded-xl border border-gray-100">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <Th>Tên chương trình</Th>
                <Th>Đại lý áp dụng</Th>
                <Th>Chiết khấu</Th>
                <Th>Thời gian</Th>
                <Th>Trạng thái</Th>
                <Th>Hành động</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {PROMO_ROWS.map((r) => (
                <tr key={r.name} className="hover:bg-gray-50/50">
                  <Td className="font-medium">{r.name}</Td>
                  <Td>{r.scope}</Td>
                  <Td>{r.discount}</Td>
                  <Td>{r.period}</Td>
                  <Td>
                    <span className={
                      r.status === 'Active'
                        ? 'rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700'
                        : r.status === 'Scheduled'
                          ? 'rounded-md bg-sky-50 px-2 py-1 text-xs font-medium text-sky-700'
                          : 'rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600'
                    }>
                      {r.status}
                    </span>
                  </Td>
                  <Td>
                    <div className="flex gap-2">
                      <button className="rounded-md border border-gray-200 px-3 py-1 text-xs hover:bg-gray-50">Sửa</button>
                      <button className="rounded-md border border-gray-200 px-3 py-1 text-xs hover:bg-gray-50">Tạm dừng</button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Reports & Analytics (simple visual placeholders) */}
      <section className="rounded-2xl bg-white p-6 shadow">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Báo cáo & phân tích</h2>
            <p className="mt-1 text-sm text-gray-500">Doanh số theo khu vực, tồn kho & tốc độ tiêu thụ</p>
          </div>
          <div className="flex gap-2">
            <button className="rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50">Lọc</button>
            <button className="rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50">Tháng này</button>
          </div>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <ChartCard title="Doanh số theo khu vực (tháng)">
            <BarChart />
          </ChartCard>
          <ChartCard title="Tồn kho & tốc độ tiêu thụ (12 tuần)">
            <LineChart />
          </ChartCard>
        </div>
      </section>
    </div>
  );
}

function KpiCard({ label, value, sub, trend, trendUp }: { label: string; value: string; sub?: string; trend?: string; trendUp?: boolean }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
      {sub ? <div className="text-xs text-gray-500">{sub}</div> : null}
      {trend ? (
        <div className={trendUp ? 'mt-2 text-xs font-medium text-emerald-600' : 'mt-2 text-xs font-medium text-gray-600'}>
          {trendUp ? '▲ ' : '– '} {trend}
        </div>
      ) : null}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
      {children}
    </th>
  );
}

function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <td className={"whitespace-nowrap px-4 py-3 text-sm " + (className ?? '')}>{children}</td>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-100 p-4">
      <div className="mb-3 text-sm font-medium text-gray-700">{title}</div>
      <div className="h-56 w-full">{children}</div>
    </div>
  );
}

function BarChart() {
  // Simple static bar chart with inline SVG
  const bars = [48, 72, 36, 90, 60, 44, 70];
  const labels = ['Bắc', 'Trung', 'Nam', 'HCM', 'HN', 'Tây', 'Đông'];
  const max = 100;
  const width = 420;
  const height = 200;
  const barWidth = 40;
  const gap = 20;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full">
      <rect x="0" y="0" width={width} height={height} rx="10" fill="#fafafa" />
      {bars.map((v, i) => {
        const x = 20 + i * (barWidth + gap);
        const h = (v / max) * 140;
        const y = 160 - h;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barWidth} height={h} rx="6" fill="#111827" />
            <text x={x + barWidth / 2} y={175} textAnchor="middle" fontSize="10" fill="#6b7280">{labels[i]}</text>
            <text x={x + barWidth / 2} y={y - 4} textAnchor="middle" fontSize="10" fill="#111827">{v}</text>
          </g>
        );
      })}
      <line x1="20" x2={width - 20} y1="160" y2="160" stroke="#e5e7eb" />
    </svg>
  );
}

function LineChart() {
  // Simple static line chart with two series
  const seriesA = [82, 78, 74, 70, 68, 66, 64, 62, 60, 58, 56, 54]; // tồn kho
  const seriesB = [10, 12, 14, 16, 18, 20, 18, 16, 18, 20, 22, 24]; // tiêu thụ
  const width = 420;
  const height = 200;
  const padding = 24;
  const maxY = 100;
  const xStep = (width - padding * 2) / (seriesA.length - 1);
  const toPoint = (v: number, i: number) => {
    const x = padding + i * xStep;
    const y = padding + (1 - v / maxY) * (height - padding * 2);
    return `${x},${y}`;
  };
  const pathA = seriesA.map(toPoint).join(' ');
  const pathB = seriesB.map(toPoint).join(' ');
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full">
      <rect x="0" y="0" width={width} height={height} rx="10" fill="#fafafa" />
      <polyline fill="none" stroke="#111827" strokeWidth="2" points={pathA} />
      <polyline fill="none" stroke="#10b981" strokeWidth="2" points={pathB} />
      {seriesA.map((v, i) => {
        const [x, y] = toPoint(v, i).split(',').map(Number);
        return <circle key={`a-${i}`} cx={x} cy={y} r="2.5" fill="#111827" />;
      })}
      {seriesB.map((v, i) => {
        const [x, y] = toPoint(v, i).split(',').map(Number);
        return <circle key={`b-${i}`} cx={x} cy={y} r="2.5" fill="#10b981" />;
      })}
      <text x={width - 8} y={height - 8} textAnchor="end" fontSize="10" fill="#6b7280">Tuần</text>
    </svg>
  );
}

const PRODUCT_ROWS = [
  { model: 'EV S1', variant: 'Std 3.5kW', color: 'Đen', wholesalePrice: '21,500,000', stock: 180, allocated: 120 },
  { model: 'EV S1', variant: 'Pro 5kW', color: 'Trắng', wholesalePrice: '26,900,000', stock: 140, allocated: 96 },
  { model: 'EV X2', variant: 'Std', color: 'Đỏ', wholesalePrice: '28,500,000', stock: 220, allocated: 170 },
  { model: 'EV X2', variant: 'Plus', color: 'Xanh', wholesalePrice: '31,900,000', stock: 150, allocated: 110 },
  { model: 'EV City', variant: 'Lite', color: 'Bạc', wholesalePrice: '18,900,000', stock: 120, allocated: 80 },
];

const DEALER_ROWS = [
  { name: 'Đại lý Quận 1', region: 'HCM', quota: 120, allocated: 90, sales: 68, receivables: '2.4 tỷ', status: 'Active' },
  { name: 'Đại lý Cầu Giấy', region: 'HN', quota: 100, allocated: 78, sales: 54, receivables: '1.9 tỷ', status: 'Active' },
  { name: 'Đại lý Đà Nẵng', region: 'Trung', quota: 80, allocated: 62, sales: 38, receivables: '1.1 tỷ', status: 'Watch' },
  { name: 'Đại lý Cần Thơ', region: 'Nam', quota: 70, allocated: 44, sales: 31, receivables: '0.7 tỷ', status: 'Active' },
];

const PROMO_ROWS = [
  { name: 'Summer Kickoff', scope: 'Toàn hệ thống', discount: '3% + quà tặng', period: '01/06 - 30/06', status: 'Active' },
  { name: 'HN Exclusive', scope: 'Khu vực Hà Nội', discount: '2% + hỗ trợ tài chính', period: '10/06 - 10/07', status: 'Scheduled' },
  { name: 'Dealer Growth', scope: 'Theo đại lý (Top 10)', discount: '4% theo bậc', period: '01/05 - 30/06', status: 'Active' },
  { name: 'Clearance', scope: 'Model EV City', discount: '1.5 triệu/xe', period: 'Đến 31/05', status: 'Ended' },
];

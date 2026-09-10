import { useCallback, useEffect, useMemo, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../redux/AuthContext";
import { paintings } from "../services/paintingApi";
import { categories } from "../services/categoryApi";
import * as admin from "../services/adminApi";
import Loader from "../components/common/Loader";
const emptyPainting = {
  title: "",
  artist: "",
  category: "",
  style: "",
  surfaceMaterial: "Vải toan",
  colorMedium: "Sơn dầu",
  description: "",
  aiSummary: "",
  imageUrl: "",
  tags: "",
  price: 0,
  isAvailable: true,
};
export default function AdminPage() {
  const { user, loading, logout } = useAuth(),
    [tab, setTab] = useState("overview"),
    [works, setWorks] = useState([]),
    [cats, setCats] = useState([]),
    [users, setUsers] = useState([]),
    [stats, setStats] = useState(null),
    [busy, setBusy] = useState(true),
    [paintingForm, setPaintingForm] = useState(null),
    [categoryForm, setCategoryForm] = useState(null),
    [query, setQuery] = useState("");
  const load = useCallback(async () => {
    setBusy(true);
    try {
      const [p, c, a, u] = await Promise.all([
        paintings({ limit: 50, sort: "-createdAt" }),
        categories(),
        admin.getAnalytics(),
        admin.getUsers(),
      ]);
      setWorks(p.data || []);
      setCats(c.data || []);
      setStats(a.data);
      setUsers(u.data || []);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  }, []);
  useEffect(() => {
    if (user?.role === "admin") load();
  }, [user, load]);
  const visible = useMemo(
    () =>
      works.filter((x) =>
        `${x.title} ${x.artist}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [works, query],
  );
  if (loading) return <Loader />;
  if (user?.role !== "admin") return <Navigate to="/" replace />;
  const savePainting = async (e) => {
    e.preventDefault();
    const f = paintingForm,
      data = new FormData();
    for (const key of [
      "title",
      "artist",
      "category",
      "style",
      "surfaceMaterial",
      "colorMedium",
      "description",
      "aiSummary",
      "price",
      "isAvailable",
    ])
      data.append(key, f[key] ?? "");
    data.append("tags", f.tags || "");
    if (f.imageFile) data.append("image", f.imageFile);
    try {
      f._id
        ? await admin.updatePainting(f._id, data)
        : await admin.createPainting(data);
      toast.success(f._id ? "Đã cập nhật tác phẩm" : "Đã thêm tác phẩm");
      setPaintingForm(null);
      load();
    } catch (x) {
      toast.error(x.message);
    }
  };
  const editPainting = (x) =>
    setPaintingForm({
      ...x,
      category: x.category?._id || x.category,
      imageUrl:
        x.images?.find((i) => i.isPrimary)?.url || x.images?.[0]?.url || "",
      tags: (x.tags || []).join(", "),
    });
  const removePainting = async (x) => {
    if (!confirm(`Xóa tác phẩm “${x.title}”? Thao tác này không thể hoàn tác.`))
      return;
    try {
      await admin.deletePainting(x._id);
      toast.success("Đã xóa tác phẩm");
      load();
    } catch (e) {
      toast.error(e.message);
    }
  };
  const saveCategory = async (e) => {
    e.preventDefault();
    try {
      categoryForm._id
        ? await admin.updateCategory(categoryForm._id, categoryForm)
        : await admin.createCategory(categoryForm);
      toast.success("Đã lưu danh mục");
      setCategoryForm(null);
      load();
    } catch (x) {
      toast.error(x.message);
    }
  };
  const removeCategory = async (x) => {
    if (!confirm(`Xóa danh mục “${x.name}”?`)) return;
    try {
      await admin.deleteCategory(x._id);
      toast.success("Đã xóa danh mục");
      load();
    } catch (e) {
      toast.error(e.message);
    }
  };
  return (
    <section className="adminPage">
      <aside className="adminSide">
        <div>
          <span className="eyebrow">TRUNG TÂM QUẢN TRỊ</span>
          <h2>ArtMind</h2>
        </div>
        <button
          className={tab === "overview" ? "active" : ""}
          onClick={() => setTab("overview")}
        >
          ▦ Tổng quan
        </button>
        <button
          className={tab === "paintings" ? "active" : ""}
          onClick={() => setTab("paintings")}
        >
          ▧ Quản lý tranh
        </button>
        <button
          className={tab === "categories" ? "active" : ""}
          onClick={() => setTab("categories")}
        >
          ◇ Danh mục
        </button>
        <button
          className={tab === "users" ? "active" : ""}
          onClick={() => setTab("users")}
        >
          ○ Người dùng
        </button>
        <div className="adminAccount">
          <Link to="/">↗ Xem trang khách</Link>
          <button
            onClick={() => {
              logout();
              location.href = "/login";
            }}
          >
            Đăng xuất
          </button>
        </div>
      </aside>
      <div className="adminMain">
        {busy ? (
          <Loader />
        ) : (
          <>
            {tab === "overview" && (
              <Overview stats={stats} works={works} cats={cats} />
            )}{" "}
            {tab === "paintings" && (
              <>
                <AdminHead
                  title="Quản lý tác phẩm"
                  note={`${works.length} tác phẩm trong hệ thống`}
                  action="＋ Thêm tác phẩm"
                  onClick={() => setPaintingForm({ ...emptyPainting })}
                />
                <div className="adminTools">
                  <input
                    placeholder="Tìm theo tên tranh hoặc họa sĩ…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
                <div className="adminTable">
                  <table>
                    <thead>
                      <tr>
                        <th>Tác phẩm</th>
                        <th>Thể loại</th>
                        <th>Chất liệu</th>
                        <th>Lượt xem</th>
                        <th>Trạng thái</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {visible.map((x) => (
                        <tr key={x._id}>
                          <td>
                            <div className="workCell">
                              <img src={x.images?.[0]?.url} alt="" />
                              <span>
                                <b>{x.title}</b>
                                <small>{x.artist}</small>
                              </span>
                            </div>
                          </td>
                          <td>{x.category?.name}</td>
                          <td>{x.colorMedium}</td>
                          <td>{x.viewCount || 0}</td>
                          <td>
                            <i
                              className={x.isAvailable ? "status on" : "status"}
                            >
                              {x.isAvailable ? "Đang trưng bày" : "Đã ẩn"}
                            </i>
                          </td>
                          <td>
                            <button onClick={() => editPainting(x)}>Sửa</button>
                            <button
                              className="danger"
                              onClick={() => removePainting(x)}
                            >
                              Xóa
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}{" "}
            {tab === "categories" && (
              <>
                <AdminHead
                  title="Quản lý danh mục"
                  note="Tổ chức bộ sưu tập theo chủ đề"
                  action="＋ Thêm danh mục"
                  onClick={() =>
                    setCategoryForm({
                      name: "",
                      description: "",
                      thumbnail: "",
                    })
                  }
                />
                <div className="categoryAdmin">
                  {cats.map((x) => (
                    <article key={x._id}>
                      <div>
                        <span>◇</span>
                        <h3>{x.name}</h3>
                        <p>{x.description || "Chưa có mô tả"}</p>
                      </div>
                      <footer>
                        <button onClick={() => setCategoryForm({ ...x })}>
                          Chỉnh sửa
                        </button>
                        <button
                          className="danger"
                          onClick={() => removeCategory(x)}
                        >
                          Xóa
                        </button>
                      </footer>
                    </article>
                  ))}
                </div>
              </>
            )}{" "}
            {tab === "users" && (
              <Users users={users} current={user} reload={load} />
            )}
          </>
        )}
      </div>
      {paintingForm && (
        <PaintingModal
          value={paintingForm}
          setValue={setPaintingForm}
          cats={cats}
          onSubmit={savePainting}
        />
      )}{" "}
      {categoryForm && (
        <CategoryModal
          value={categoryForm}
          setValue={setCategoryForm}
          onSubmit={saveCategory}
        />
      )}
    </section>
  );
}
function AdminHead({ title, note, action, onClick }) {
  return (
    <div className="adminHead">
      <div>
        <span className="eyebrow">QUẢN LÝ NỘI DUNG</span>
        <h1>{title}</h1>
        <p>{note}</p>
      </div>
      <button className="pill" onClick={onClick}>
        {action}
      </button>
    </div>
  );
}
function Overview({ stats, works, cats }) {
  const types = Object.fromEntries(
    (stats?.eventsByType || []).map((x) => [x._id, x.count]),
  );
  return (
    <>
      <div className="adminHead">
        <div>
          <span className="eyebrow">30 NGÀY GẦN NHẤT</span>
          <h1>Tổng quan hệ thống</h1>
          <p>Theo dõi hoạt động và mức độ quan tâm của người dùng.</p>
        </div>
      </div>
      <div className="metricGrid">
        <Metric label="Tổng tác phẩm" value={works.length} />
        <Metric label="Danh mục" value={cats.length} />
        <Metric label="Lượt xem" value={types.view || 0} />
        <Metric label="Lượt tìm kiếm" value={types.search || 0} />
        <Metric label="Lượt yêu thích" value={types.favorite || 0} />
        <Metric label="Tổng tương tác" value={stats?.totalEvents || 0} />
      </div>
      <div className="adminPanels">
        <div>
          <h2>Tác phẩm nổi bật</h2>
          {(stats?.trendingPaintings || []).slice(0, 5).map((x, i) => (
            <p className="rank" key={x._id}>
              <b>{String(i + 1).padStart(2, "0")}</b>
              <span>
                {x.title}
                <small>
                  {x.viewCount} lượt xem · {x.favoriteCount} yêu thích
                </small>
              </span>
            </p>
          ))}
        </div>
        <div>
          <h2>Từ khóa phổ biến</h2>
          {stats?.popularSearches?.length ? (
            stats.popularSearches.map((x) => (
              <p className="searchRank" key={x._id}>
                <span>{x._id}</span>
                <b>{x.count}</b>
              </p>
            ))
          ) : (
            <p className="muted">Chưa có dữ liệu tìm kiếm.</p>
          )}
        </div>
      </div>
    </>
  );
}
function Metric({ label, value }) {
  return (
    <article>
      <small>{label}</small>
      <b>{Number(value).toLocaleString("vi-VN")}</b>
      <span>↗</span>
    </article>
  );
}
function Users({ users, current, reload }) {
  const change = async (u, data) => {
    try {
      await admin.updateUser(u._id, data);
      toast.success("Đã cập nhật người dùng");
      reload();
    } catch (e) {
      toast.error(e.message);
    }
  };
  return (
    <>
      <div className="adminHead">
        <div>
          <span className="eyebrow">TÀI KHOẢN HỆ THỐNG</span>
          <h1>Quản lý người dùng</h1>
          <p>{users.length} tài khoản đã đăng ký</p>
        </div>
      </div>
      <div className="adminTable">
        <table>
          <thead>
            <tr>
              <th>Người dùng</th>
              <th>Vai trò</th>
              <th>Ngày tham gia</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>
                  <div className="userCell">
                    <b>{u.name}</b>
                    <small>{u.email}</small>
                  </div>
                </td>
                <td>
                  <select
                    value={u.role}
                    disabled={u._id === current.id}
                    onChange={(e) => change(u, { role: e.target.value })}
                  >
                    <option value="user">Người dùng</option>
                    <option value="admin">Quản trị viên</option>
                  </select>
                </td>
                <td>{new Date(u.createdAt).toLocaleDateString("vi-VN")}</td>
                <td>
                  <i className={u.isActive ? "status on" : "status"}>
                    {u.isActive ? "Đang hoạt động" : "Đã khóa"}
                  </i>
                </td>
                <td>
                  <button
                    disabled={u._id === current.id}
                    className={u.isActive ? "danger" : ""}
                    onClick={() => change(u, { isActive: !u.isActive })}
                  >
                    {u._id === current.id
                      ? "Tài khoản hiện tại"
                      : u.isActive
                        ? "Khóa tài khoản"
                        : "Mở khóa"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
function PaintingModal({ value, setValue, cats, onSubmit }) {
  const change = (e) =>
    setValue({
      ...value,
      [e.target.name]:
        e.target.type === "checkbox" ? e.target.checked : e.target.value,
    });
  const chooseImage = (e) => {
    const file = e.target.files?.[0];
    if (file)
      setValue({
        ...value,
        imageFile: file,
        imagePreview: URL.createObjectURL(file),
      });
  };
  const preview =
    value.imagePreview ||
    value.images?.find((x) => x.isPrimary)?.url ||
    value.images?.[0]?.url;
  return (
    <div className="modalBack">
      <form className="adminModal" onSubmit={onSubmit}>
        <div className="modalHead">
          <div>
            <span className="eyebrow">TÁC PHẨM</span>
            <h2>{value._id ? "Chỉnh sửa tác phẩm" : "Thêm tác phẩm mới"}</h2>
          </div>
          <button type="button" onClick={() => setValue(null)}>
            ×
          </button>
        </div>
        <div className="formGrid">
          <label>
            Tên tác phẩm *
            <input
              name="title"
              required
              value={value.title}
              onChange={change}
            />
          </label>
          <label>
            Họa sĩ *
            <input
              name="artist"
              required
              value={value.artist}
              onChange={change}
            />
          </label>
          <label>
            Danh mục *
            <select
              name="category"
              required
              value={value.category}
              onChange={change}
            >
              <option value="">Chọn danh mục</option>
              {cats.map((x) => (
                <option value={x._id} key={x._id}>
                  {x.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Phong cách
            <input name="style" value={value.style || ""} onChange={change} />
          </label>
          <label>
            Chất liệu màu
            <input
              name="colorMedium"
              value={value.colorMedium || ""}
              onChange={change}
            />
          </label>
          <label>
            Bề mặt
            <input
              name="surfaceMaterial"
              value={value.surfaceMaterial || ""}
              onChange={change}
            />
          </label>
          <label className="wide paintingUpload">
            <span>Ảnh tác phẩm {!value._id && "*"}</span>
            <input
              type="file"
              name="image"
              accept="image/jpeg,image/png,image/webp,image/gif"
              required={!value._id && !preview}
              onChange={chooseImage}
            />
            <div>
              {preview ? (
                <img src={preview} alt="Xem trước tác phẩm" />
              ) : (
                <>
                  <b>＋</b>
                  <strong>CHỌN ẢNH TỪ MÁY</strong>
                  <small>JPG, PNG, WEBP hoặc GIF · tối đa 8MB</small>
                </>
              )}
            </div>
          </label>
          <label className="wide">
            Từ khóa, cách nhau bằng dấu phẩy
            <input name="tags" value={value.tags || ""} onChange={change} />
          </label>
          <label className="wide">
            Mô tả
            <textarea
              name="description"
              rows="4"
              value={value.description || ""}
              onChange={change}
            />
          </label>
          <label className="wide">
            Tóm tắt AI
            <textarea
              name="aiSummary"
              rows="3"
              value={value.aiSummary || ""}
              onChange={change}
            />
          </label>
          <label>
            Giá tham khảo
            <input
              type="number"
              min="0"
              name="price"
              value={value.price || 0}
              onChange={change}
            />
          </label>
          <label className="check">
            <input
              type="checkbox"
              name="isAvailable"
              checked={value.isAvailable}
              onChange={change}
            />{" "}
            Đang trưng bày
          </label>
        </div>
        <div className="modalActions">
          <button type="button" onClick={() => setValue(null)}>
            Hủy
          </button>
          <button className="pill">Lưu tác phẩm</button>
        </div>
      </form>
    </div>
  );
}
function CategoryModal({ value, setValue, onSubmit }) {
  const change = (e) => setValue({ ...value, [e.target.name]: e.target.value });
  return (
    <div className="modalBack">
      <form className="adminModal smallModal" onSubmit={onSubmit}>
        <div className="modalHead">
          <div>
            <span className="eyebrow">DANH MỤC</span>
            <h2>{value._id ? "Chỉnh sửa danh mục" : "Thêm danh mục"}</h2>
          </div>
          <button type="button" onClick={() => setValue(null)}>
            ×
          </button>
        </div>
        <label>
          Tên danh mục *
          <input required name="name" value={value.name} onChange={change} />
        </label>
        <label>
          Mô tả
          <textarea
            rows="4"
            name="description"
            value={value.description || ""}
            onChange={change}
          />
        </label>
        <label>
          URL ảnh đại diện
          <input
            type="url"
            name="thumbnail"
            value={value.thumbnail || ""}
            onChange={change}
          />
        </label>
        <div className="modalActions">
          <button type="button" onClick={() => setValue(null)}>
            Hủy
          </button>
          <button className="pill">Lưu danh mục</button>
        </div>
      </form>
    </div>
  );
}

# Pages CMS 使用说明

## 登录

1. 打开 https://app.pagescms.org
2. 使用拥有 `sissidongxiaoxi/sissiphotograph` 仓库权限的 GitHub 账号登录。
3. 选择 `sissidongxiaoxi/sissiphotograph`，分支选择 `main`。
4. 进入 **Photography projects**。

## 调整项目顺序

在项目列表中拖动项目卡片。最上面的项目会成为书架中的第一本书。保存后网站会按新顺序显示。

## 新增项目

1. 点击新增项目。
2. 填写 **Display title**、**Spine and gallery title**、年份和书脊颜色。
3. `Spine and gallery title` 中的大小写与下划线会原样显示在书脊和画廊标题上。
4. 为 **Cover image** 选择一张封面照片。
5. 在 **Gallery images** 中上传或选择项目照片，并拖动调整顺序。
6. 保存。

上传前请先导出网页版本：

- 封面与首页图片：长边不超过 3000 px。
- 画廊图片：长边不超过 2560 px。
- 建议使用 WebP（质量 80–85）或经过压缩的 JPG。
- 单张尽量控制在 2 MB 以内。

原始高分辨率照片请保存在电脑或云盘中，不要上传到网站后台。

## 修改封面或画廊

- 更换封面：修改项目的 **Cover image**。
- 调整照片顺序：在 **Gallery images** 中拖动图片。
- 增删照片：在 **Gallery images** 中添加或移除图片。
- 修改项目顺序：拖动项目本身，而不是画廊中的图片。

保存操作会直接提交到 GitHub。若网站已连接自动部署服务，部署完成后改动会自动上线。

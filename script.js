    let allImages = [];

    document.getElementById('folderInput').addEventListener('change', function(event) {
        const files = event.target.files;
        const thumbnailsContainer = document.getElementById('thumbnails');
        thumbnailsContainer.innerHTML = ''; // 清空之前的缩略图
        allImages = Array.from(files).filter(file => file.type.startsWith('image/'));

        allImages.forEach(file => {
            const reader = new FileReader();

            reader.onload = function(e) {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.alt = file.name;
                img.dataset.file = file;

                img.addEventListener('click', function() {
                    // 移除其他图片的选中状态
                    document.querySelectorAll('.thumbnails img').forEach(img => img.classList.remove('selected'));
                    img.classList.add('selected'); // 设置当前图片为选中状态

                    // 显示调整后的图片在预览窗口
                    adjustAndPreviewImage(file);
                });

                thumbnailsContainer.appendChild(img);
            };

            reader.readAsDataURL(file);
        });
    });

    function adjustAndPreviewImage(file) {
        const dpi = parseInt(document.getElementById('dpiInput').value);

        if (isNaN(dpi) || dpi <= 0) {
            alert('请输入有效的DPI值！');
            return;
        }

        const widthCm = parseFloat(document.getElementById('widthInput').value);
        const heightCm = parseFloat(document.getElementById('heightInput').value);

        if (isNaN(widthCm) || isNaN(heightCm) || widthCm <= 0 || heightCm <= 0) {
            alert('请输入有效的宽度和高度！');
            return;
        }

        const marginTop = mmToPx(parseInt(document.getElementById('marginTopInput').value));
        const marginBottom = mmToPx(parseInt(document.getElementById('marginBottomInput').value));
        const marginLeft = mmToPx(parseInt(document.getElementById('marginLeftInput').value));
        const marginRight = mmToPx(parseInt(document.getElementById('marginRightInput').value));

               // 转换为像素
               const widthPx = cmToPx(widthCm, dpi);
        const heightPx = cmToPx(heightCm, dpi);

        // 检查边距是否超出设定尺寸
        if (marginTop + marginBottom >= heightPx || marginLeft + marginRight >= widthPx) {
            alert('边距设置超出图片尺寸，请重新输入边距值！');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.src = event.target.result;

            img.onload = function() {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                // 计算画布的实际尺寸（包括边距）
                canvas.width = widthPx;
                canvas.height = heightPx;

                // 填充背景颜色为白色
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // 等比例缩放，多余部分留白
                const scale = Math.min((widthPx - marginLeft - marginRight) / img.width, (heightPx - marginTop - marginBottom) / img.height);
                const x = marginLeft + ((widthPx - marginLeft - marginRight) - img.width * scale) / 2;
                const y = marginTop + ((heightPx - marginTop - marginBottom) - img.height * scale) / 2;

                ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

                // 更新预览图片
                const previewImage = document.getElementById('previewImage');
                previewImage.src = canvas.toDataURL('image/jpeg');
                previewImage.style.display = 'block';

                // 更新预览尺寸显示
                const previewDimensions = document.getElementById('previewDimensions');
                previewDimensions.textContent = `当前尺寸: ${widthCm} cm x ${heightCm} cm`;
            };
        };

        reader.readAsDataURL(file);
    }

    document.getElementById('swapButton').addEventListener('click', function() {
        const widthInput = document.getElementById('widthInput');
        const heightInput = document.getElementById('heightInput');

        const temp = widthInput.value;
        widthInput.value = heightInput.value;
        heightInput.value = temp;

        // 交换宽高后直接更新预览
        const selectedThumbnail = document.querySelector('.thumbnails img.selected');
        if (selectedThumbnail) {
            const file = selectedThumbnail.dataset.file;
            adjustAndPreviewImage(file);
        }
    });

    document.getElementById('resizeButton').addEventListener('click', function() {
        if (allImages.length === 0) {
            alert('请先选择至少一张图片！');
            return;
        }

        const dpi = parseInt(document.getElementById('dpiInput').value);

        if (isNaN(dpi) || dpi <= 0) {
            alert('请输入有效的DPI值！');
            return;
        }

        const widthCm = parseFloat(document.getElementById('widthInput').value);
        const heightCm = parseFloat(document.getElementById('heightInput').value);

        if (isNaN(widthCm) || isNaN(heightCm) || widthCm <= 0 || heightCm <= 0) {
            alert('请输入有效的宽度和高度！');
            return;
        }

        const widthPx = cmToPx(widthCm, dpi);
        const heightPx = cmToPx(heightCm, dpi);

        const marginTop = mmToPx(parseInt(document.getElementById('marginTopInput').value));
        const marginBottom = mmToPx(parseInt(document.getElementById('marginBottomInput').value));
        const marginLeft = mmToPx(parseInt(document.getElementById('marginLeftInput').value));
        const marginRight = mmToPx(parseInt(document.getElementById('marginRightInput').value));

        // 检查边距是否超出设定尺寸
        if (marginTop + marginBottom >= heightPx || marginLeft + marginRight >= widthPx) {
            alert('边距设置超出图片尺寸，请重新输入边距值！');
            return;
        }

        const progressBar = document.getElementById('progressBar');
        progressBar.style.width = '0%';

        let completedCount = 0;

        allImages.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = function(event) {
                const img = new Image();
                img.src = event.target.result;

                img.onload = function() {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    // 计算画布的实际尺寸（包括边距）
                    canvas.width = widthPx;
                    canvas.height = heightPx;

                    // 填充背景颜色为白色
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);

                    // 等比例缩放，多余部分留白
                    const scale = Math.min((widthPx - marginLeft - marginRight) / img.width, (heightPx - marginTop - marginBottom) / img.height);
                    const x = marginLeft + ((widthPx - marginLeft - marginRight) - img.width * scale) / 2;
                    const y = marginTop + ((heightPx - marginTop - marginBottom) - img.height * scale) / 2;

                    ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

                    // 更新进度条
                    completedCount++;
                    const progress = (completedCount / allImages.length) * 100;
                    progressBar.style.width = `${progress}%`;
                };
            };

            reader.readAsDataURL(file);
        });
    });

    document.getElementById('exportButton').addEventListener('click', function() {
        if (allImages.length === 0) {
            alert('请先选择至少一张图片！');
            return;
        }

        const dpi = parseInt(document.getElementById('dpiInput').value);

        if (isNaN(dpi) || dpi <= 0) {
            alert('请输入有效的DPI值！');
            return;
        }

        const widthCm = parseFloat(document.getElementById('widthInput').value);
        const heightCm = parseFloat(document.getElementById('heightInput').value);

        if (isNaN(widthCm) || isNaN(heightCm) || widthCm <= 0 || heightCm <= 0) {
            alert('请输入有效的宽度和高度！');
            return;
        }

        const widthPx = cmToPx(widthCm, dpi);
        const heightPx = cmToPx(heightCm, dpi);

        const marginTop = mmToPx(parseInt(document.getElementById('marginTopInput').value));
        const marginBottom = mmToPx(parseInt(document.getElementById('marginBottomInput').value));
        const marginLeft = mmToPx(parseInt(document.getElementById('marginLeftInput').value));
        const marginRight = mmToPx(parseInt(document.getElementById('marginRightInput').value));

        // 检查边距是否超出设定尺寸
        if (marginTop + marginBottom >= heightPx || marginLeft + marginRight >= widthPx) {
            alert('边距设置超出图片尺寸，请重新输入边距值！');
            return;
        }

        const zip = new JSZip();
        let completedCount = 0;

        allImages.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = function(event) {
                const img = new Image();
                img.src = event.target.result;

                img.onload = function() {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    // 计算画布的实际尺寸（包括边距）
                    canvas.width = widthPx;
                    canvas.height = heightPx;

                    // 填充背景颜色为白色
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);

                    // 等比例缩放，多余部分留白
                    const scale = Math.min((widthPx - marginLeft - marginRight) / img.width, (heightPx - marginTop - marginBottom) / img.height);
                    const x = marginLeft + ((widthPx - marginLeft - marginRight) - img.width * scale) / 2;
                    const y = marginTop + ((heightPx - marginTop - marginBottom) - img.height * scale) / 2;

                    ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

                    // 将调整后的图片添加到压缩包
                    const resizedDataUrl = canvas.toDataURL('image/jpeg');
                    const base64Data = resizedDataUrl.split(',')[1];
                    zip.file(`resized_${file.name}`, base64Data, { base64: true });

                    // 更新进度条
                    completedCount++;
                    const progress = (completedCount / allImages.length) * 100;
                    document.getElementById('progressBar').style.width = `${progress}%`;

                    // 如果所有图片都处理完毕，则生成并下载压缩包
                    if (completedCount === allImages.length) {
                        zip.generateAsync({ type: 'blob' }).then(function(content) {
                            const link = document.createElement('a');
                            link.href = URL.createObjectURL(content);
                            link.download = 'adjusted_images.zip';
                            link.click();
                        });
                    }
                };
            };

            reader.readAsDataURL(file);
        });
    });

    // 常用尺寸按钮事件
    document.querySelectorAll('.preset-buttons button').forEach(button => {
        button.addEventListener('click', function() {
            const preset = this.dataset.preset;

            let widthCm, heightCm; // 默认单位为厘米
            switch (preset) {
                case 'A5': widthCm = 14.8; heightCm = 21; break;
                case 'A4': widthCm = 29.7; heightCm = 21; break;
                case 'A3': widthCm = 29.7; heightCm = 42; break;
                case '3inch': widthCm = 5.1; heightCm = 7.6; break;
                case '5inch': widthCm = 8.9; heightCm = 12.7; break;
                case '6inch': widthCm = 10.2; heightCm = 15.2; break;
            }

            document.getElementById('widthInput').value = widthCm.toFixed(2); // 保留两位小数
            document.getElementById('heightInput').value = heightCm.toFixed(2);

            // 更新预览
            const selectedThumbnail = document.querySelector('.thumbnails img.selected');
            if (selectedThumbnail) {
                const file = selectedThumbnail.dataset.file;
                adjustAndPreviewImage(file);
            }
        });
    });

    // 其他尺寸菜单事件
    document.getElementById('presetSelect').addEventListener('change', function() {
        const preset = this.value;

        if (!preset) return;

        let widthCm, heightCm; // 默认单位为厘米
        switch (preset) {
            case 'A2': widthCm = 42; heightCm = 59.4; break;
            case 'A1': widthCm = 59.4; heightCm = 84.1; break;
            case '1inch': widthCm = 2.5; heightCm = 3.5; break;
            case '2inch': widthCm = 3.5; heightCm = 4.5; break;
            case '7inch': widthCm = 12.7; heightCm = 17.8; break;
            case '8inch': widthCm = 15.2; heightCm = 20.3; break;
            case '10inch': widthCm = 20.3; heightCm = 25.4; break;
            case '12inch': widthCm = 25.4; heightCm = 30.5; break;
            case '14inch': widthCm = 28; heightCm = 35.6; break;
            case '16inch': widthCm = 30.5; heightCm = 40.6; break;
            case '18inch': widthCm = 35.6; heightCm = 45.7; break;
            case '20inch': widthCm = 40.6; heightCm = 50.8; break;
            case '24inch': widthCm = 50.8; heightCm = 61; break;
            case '30inch': widthCm = 61; heightCm = 76.2; break;
            case '32inch': widthCm = 66; heightCm = 81.3; break;
            case '36inch': widthCm = 61; heightCm = 91.4; break;
        }

        document.getElementById('widthInput').value = widthCm.toFixed(2); // 保留两位小数
        document.getElementById('heightInput').value = heightCm.toFixed(2);

        // 更新预览
        const selectedThumbnail = document.querySelector('.thumbnails img.selected');
        if (selectedThumbnail) {
            const file = selectedThumbnail.dataset.file;
            adjustAndPreviewImage(file);
        }
    });

    // 将厘米转换为像素
    function cmToPx(cm, dpi) {
        return Math.round(cm * dpi / 2.54);
    }

    // 将毫米转换为像素
    function mmToPx(mm) {
        const dpi = parseInt(document.getElementById('dpiInput').value);
        return Math.round(mm * dpi / 25.4);
    }
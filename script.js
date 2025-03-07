document.addEventListener("DOMContentLoaded", function () {
    const textareas = {
        html: document.getElementById("html"),
        css: document.getElementById("css"),
        js: document.getElementById("js")
    };
    const output = document.getElementById("output");
    const tabs = document.querySelectorAll(".tab");
    const projectList = document.getElementById("project-list");
    const newProjectBtn = document.getElementById("new-project-btn");
    const editorContainer = document.getElementById("editor-container");
    const previewContainer = document.getElementById("preview-container");

    let projects = JSON.parse(localStorage.getItem('projects')) || {};
    let currentProject = null;

    const editors = {
        html: CodeMirror.fromTextArea(textareas.html, {
            mode: "htmlmixed",
            theme: "neo",
            lineNumbers: true,
            lineWrapping: true,
            viewportMargin: Infinity
        }),
        css: CodeMirror.fromTextArea(textareas.css, {
            mode: "css",
            theme: "neo",
            lineNumbers: true,
            lineWrapping: true,
            viewportMargin: Infinity
        }),
        js: CodeMirror.fromTextArea(textareas.js, {
            mode: "javascript",
            theme: "neo",
            lineNumbers: true,
            lineWrapping: true,
            viewportMargin: Infinity
        }),
    };

    function switchTab(tabName) {
        tabs.forEach(tab => tab.classList.remove('active'));
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        if (tabName === 'preview') {
            editorContainer.style.display = 'none';
            previewContainer.style.display = 'block';
            updatePreview();
        } else {
            editorContainer.style.display = 'flex';
            previewContainer.style.display = 'none';

            Object.keys(editors).forEach(key => {
                editors[key].getWrapperElement().style.display = (key === tabName) ? 'block' : 'none';
                editors[key].refresh(); // רענון התצוגה של העורך
            });
        }
    }

    function updatePreview() {
        const html = editors.html.getValue();
        const css = `<style>${editors.css.getValue()}</style>`;
        const js = `<script>${editors.js.getValue()}<\/script>`;
        const iframeDocument = output.contentDocument;
        iframeDocument.open();
        iframeDocument.write(html + css + js);
        iframeDocument.close();
    }

    function saveProject() {
        if (currentProject) {
            projects[currentProject] = {
                html: editors.html.getValue(),
                css: editors.css.getValue(),
                js: editors.js.getValue()
            };
            localStorage.setItem('projects', JSON.stringify(projects));
        }
    }

    function refreshEditors() {
        Object.values(editors).forEach(editor => editor.refresh());
    }

    Object.values(editors).forEach(editor => {
        editor.on('change', () => {
            saveProject();
            if (document.querySelector('[data-tab="preview"]').classList.contains('active')) {
                updatePreview();
            }
        });
    });

    tabs.forEach(tab => {
        tab.addEventListener("click", function () {
            switchTab(tab.dataset.tab);
        });
    });

    newProjectBtn.addEventListener('click', () => {
        const projectName = prompt('הכנס שם לפרויקט חדש:');
        if (projectName) {
            projects[projectName] = { html: '', css: '', js: '' };
            localStorage.setItem('projects', JSON.stringify(projects));
            currentProject = projectName;
            editors.html.setValue('');
            editors.css.setValue('');
            editors.js.setValue('');
            switchTab('html');
        }
    });

    window.addEventListener("resize", refreshEditors);
    setTimeout(refreshEditors, 500); // מבטיח שהעורכים מוצגים נכון אחרי טעינה

    updatePreview();
});

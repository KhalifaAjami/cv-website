document.addEventListener('DOMContentLoaded', function() {
    // Dark mode toggle logic
    const darkModeToggle = document.getElementById('darkModeToggle');
    const icon = darkModeToggle.querySelector('i');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    function setDarkMode(on) {
        document.body.classList.toggle('dark-mode', on);
        icon.classList.toggle('fa-moon', !on);
        icon.classList.toggle('fa-sun', on);
    }
    // Load preference
    let darkPref = localStorage.getItem('cv-dark-mode');
    if (darkPref === null) {
        setDarkMode(true); // Always default to dark mode
    } else {
        setDarkMode(darkPref === 'true');
    }
    darkModeToggle.addEventListener('click', function() {
        const isDark = !document.body.classList.contains('dark-mode');
        setDarkMode(isDark);
        localStorage.setItem('cv-dark-mode', isDark);
    });

    // Scroll-to-top button
    const scrollBtn = document.getElementById('scrollToTop');
    function handleScroll() {
        if (window.scrollY > 200) {
            scrollBtn.classList.add('visible');
        } else {
            scrollBtn.classList.remove('visible');
        }
    }
    window.addEventListener('scroll', handleScroll);
    scrollBtn.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Download PDF button
    const downloadBtn = document.getElementById('downloadPDF');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function() {
            window.print();
        });
    }

    fetch('cv.json')
        .then(response => response.json())
        .then(data => renderCV(data))
        .catch(error => {
            document.body.innerHTML = '<p style="color:red;">Failed to load CV data.</p>';
        });
});

function typeText(element, text, speed=65, loop=false) {
    let i = 0;
    function type() {
        if (i <= text.length) {
            element.textContent = text.slice(0, i);
            i++;
            setTimeout(type, speed);
        } else if (loop) {
            setTimeout(() => {
                i = 0;
                type();
            }, 1500);
        }
    }
    type();
}

function renderCV(data) {
    // Photo
    if (data.photo) {
        document.getElementById('photo').src = data.photo;
        document.getElementById('photo').alt = data.name + ' photo';
    } else {
        document.getElementById('photo').src = 'https://avatars.githubusercontent.com/u/9919?s=200&v=4';
        document.getElementById('photo').alt = 'Profile photo';
    }

    // Name & Typing Title
    document.getElementById('name').textContent = data.name || '';
    if (data.title) {
        const typedTitle = document.getElementById('typed-title');
        typedTitle.textContent = data.title;
    }

    // Contact
    let contactHTML = '';
    if (data.contact) {
        if (data.contact.email) contactHTML += `<div><i class="fa fa-envelope"></i> <a href="mailto:${data.contact.email}">${data.contact.email}</a></div>`;
        if (data.contact.phone) contactHTML += `<div><i class="fa fa-phone"></i> ${data.contact.phone}</div>`;
        if (data.contact.location) contactHTML += `<div><i class="fa fa-location-dot"></i> ${data.contact.location}</div>`;
    }
    document.getElementById('contact').innerHTML = contactHTML;

    // Links
    let linksHTML = '';
    if (data.links) {
        if (data.links.github) linksHTML += `<a href="${data.links.github}" target="_blank" title="GitHub"><i class="fab fa-github"></i></a>`;
        if (data.links.linkedin) linksHTML += `<a href="${data.links.linkedin}" target="_blank" title="LinkedIn"><i class="fab fa-linkedin"></i></a>`;
        if (data.links.website) linksHTML += `<a href="${data.links.website}" target="_blank" title="Portfolio"><i class="fa fa-globe"></i></a>`;
        if (data.links.twitter) linksHTML += `<a href="${data.links.twitter}" target="_blank" title="Twitter"><i class="fab fa-twitter"></i></a>`;
    }
    document.getElementById('links').innerHTML = linksHTML;

    // About
    document.getElementById('about').innerHTML = `
        <h2><i class="fa fa-user"></i> About Me</h2>
        <p>${data.about || ''}</p>
    `;

    // Experience
    document.getElementById('experience').innerHTML = `
        <h2><i class="fa fa-briefcase"></i> Experience</h2>
        <ul>${(data.experience||[]).map(job => `
            <li style="margin-bottom:10px;">
                <strong>${job.role}</strong> at <span style="color:#2a5298;">${job.company}</span> <span style="color:#4b6584;">(${job.period})</span><br>
                <span>${job.description}</span>
                ${job.tech ? `<br><span style='font-size:0.95em;'><span class='tech-label'>Tech:</span> <span class='tech-stack'>${job.tech.join(', ')}</span></span>` : ''}
            </li>
        `).join('')}</ul>
    `;

    // Projects (with thumbnails)
    document.getElementById('projects').innerHTML = `
        <h2><i class="fa fa-code"></i> Projects</h2>
        ${(data.projects||[]).map(project => `
            <div class="project-card">
                ${project.thumb ? `<img src='${project.thumb}' class='project-thumb' alt='${project.name} logo'>` : `<div class='project-thumb' style='background:#e3eafc;display:inline-block;'></div>`}
                <div style='overflow:hidden;'>
                    <h3>${project.name}</h3>
                    <div style="color:#2a5298;font-size:0.98em;margin-bottom:2px;">${project.role||''}</div>
                    <div>${project.description}</div>
                    ${((project.link && project.link.trim()) || (project.github && project.github.trim())) ? `<div class="project-links">${(project.link && project.link.trim()) ? `<a href="${project.link}" target="_blank"><i class="fa fa-link"></i> Live</a>` : ''}${(project.github && project.github.trim()) ? `<a href="${project.github}" target="_blank"><i class="fab fa-github"></i> Code</a>` : ''}</div>` : ''}
                    ${project.tech ? `<div style='font-size:0.95em;'><span class='tech-label'>Tech:</span> <span class='tech-stack'>${project.tech.join(', ')}</span></div>` : ''}
                </div>
            </div>
        `).join('')}
    `;

    // Education
    document.getElementById('education').innerHTML = `
        <h2><i class="fa fa-graduation-cap"></i> Education</h2>
        <ul>${(data.education||[]).map(edu => `
            <li>
                <strong>${edu.degree}</strong> - ${edu.institution} <span style="color:#4b6584;">(${edu.period})</span>
            </li>
        `).join('')}</ul>
    `;

    // Skills (categorized, with bars)
    let skillHTML = '<h2><i class="fa fa-lightbulb"></i> Skills</h2>';
    if (data.skills) {
        if (data.skills.languages) {
            skillHTML += `<div class='skills-category'><b>Languages:</b><ul>${data.skills.languages.map(skill => `<li>${typeof skill === 'string' ? skill : skill.name}</li>`).join('')}</ul>${data.skills.languages.map(skill => typeof skill === 'object' && skill.level ? `<div class='skill-bar'><div class='skill-bar-fill' data-skill='${skill.name}' style='width:0'></div></div>` : '').join('')}</div>`;
        }
        if (data.skills.frameworks) {
            skillHTML += `<div class='skills-category'><b>Frameworks:</b><ul>${data.skills.frameworks.map(skill => `<li>${typeof skill === 'string' ? skill : skill.name}</li>`).join('')}</ul>${data.skills.frameworks.map(skill => typeof skill === 'object' && skill.level ? `<div class='skill-bar'><div class='skill-bar-fill' data-skill='${skill.name}' style='width:0'></div></div>` : '').join('')}</div>`;
        }
        if (data.skills.tools) {
            skillHTML += `<div class='skills-category'><b>Tools:</b><ul>${data.skills.tools.map(skill => `<li>${typeof skill === 'string' ? skill : skill.name}</li>`).join('')}</ul>${data.skills.tools.map(skill => typeof skill === 'object' && skill.level ? `<div class='skill-bar'><div class='skill-bar-fill' data-skill='${skill.name}' style='width:0'></div></div>` : '').join('')}</div>`;
        }
        if (data.skills.other) {
            skillHTML += `<div class='skills-category'><b>Other:</b><ul>${data.skills.other.map(skill => `<li>${typeof skill === 'string' ? skill : skill.name}</li>`).join('')}</ul>${data.skills.other.map(skill => typeof skill === 'object' && skill.level ? `<div class='skill-bar'><div class='skill-bar-fill' data-skill='${skill.name}' style='width:0'></div></div>` : '').join('')}</div>`;
        }
    }
    document.getElementById('skills').innerHTML = skillHTML;

    // Animate skill bars if present
    setTimeout(() => {
        const fillEls = document.querySelectorAll('.skill-bar-fill');
        fillEls.forEach(el => {
            const skillName = el.getAttribute('data-skill');
            let level = 100;
            // Try to find level in JSON
            if (data.skills) {
                ["languages","frameworks","tools","other"].forEach(cat => {
                    if (data.skills[cat]) {
                        const found = data.skills[cat].find(s => typeof s === 'object' && s.name === skillName);
                        if (found && found.level) level = found.level;
                    }
                });
            }
            el.style.width = level + '%';
        });
    }, 300);

    // Certifications
    if (data.certifications && data.certifications.length > 0) {
        document.getElementById('certifications').innerHTML = `
            <h2><i class="fa fa-certificate"></i> Certifications</h2>
            <ul>${data.certifications.map(cert => `<li><b>${cert.title}</b> - ${cert.issuer} (${cert.year})</li>`).join('')}</ul>
        `;
    } else {
        document.getElementById('certifications').innerHTML = '';
    }

    // Awards
    if (data.awards && data.awards.length > 0) {
        document.getElementById('awards').innerHTML = `
            <h2><i class="fa fa-trophy"></i> Awards</h2>
            <ul>${data.awards.map(award => `<li><b>${award.title}</b> - ${award.issuer} (${award.year})</li>`).join('')}</ul>
        `;
    } else {
        document.getElementById('awards').innerHTML = '';
    }
}

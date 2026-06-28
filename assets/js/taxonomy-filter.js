(function () {
  function getHashId(hash) {
    if (!hash) {
      return '';
    }

    var raw = hash.charAt(0) === '#' ? hash.slice(1) : hash;

    try {
      return decodeURIComponent(raw);
    } catch (error) {
      return raw;
    }
  }

  function initTaxonomyFilter() {
    if (!document.body.classList.contains('layout--categories') && !document.body.classList.contains('layout--tags')) {
      return;
    }

    var index = document.querySelector('.taxonomy-index');
    var sections = Array.prototype.slice.call(document.querySelectorAll('.taxonomy-section'));

    if (!index || sections.length === 0) {
      return;
    }

    var links = Array.prototype.slice.call(index.querySelectorAll('a[href^="#"]'));
    var sectionsById = sections.reduce(function (memo, section) {
      memo[section.id] = section;
      return memo;
    }, {});

    function activate(id, updateHash) {
      var target = sectionsById[id] || sections[0];

      sections.forEach(function (section) {
        var isActive = section === target;
        section.classList.toggle('is-active', isActive);
        section.hidden = !isActive;
      });

      links.forEach(function (link) {
        var isActive = getHashId(link.getAttribute('href')) === target.id;
        link.classList.toggle('is-active', isActive);

        if (isActive) {
          link.setAttribute('aria-current', 'true');
        } else {
          link.removeAttribute('aria-current');
        }
      });

      if (updateHash && window.history && window.history.pushState) {
        window.history.pushState(null, '', '#' + encodeURIComponent(target.id));
      }
    }

    links.forEach(function (link) {
      link.addEventListener('click', function (event) {
        event.preventDefault();
        activate(getHashId(link.getAttribute('href')), true);
      });
    });

    window.addEventListener('hashchange', function () {
      activate(getHashId(window.location.hash), false);
    });

    activate(getHashId(window.location.hash), false);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTaxonomyFilter);
  } else {
    initTaxonomyFilter();
  }
})();

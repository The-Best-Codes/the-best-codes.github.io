var bc_contextMenu;
var bc_menuHead;
var bc_menuItems = [];

var bc_defaultMenuItems = [
  { "Open Settings": "bcEval('ww_openSettings();');" },
  { "Reload Page": "bcEval('window.location.reload();');" },
  { "Open DevTools": "debugger" },
  { "Print Page": "bcEval('window.print();');" },
  {
    "Print Element":
      "bcEval('BcHelpers.printElement(`$targetNodeParentHTML$`);');",
  },
];
var bc_defaultImageMenuItems = [
  { "Open image in new tab": "bcEval('window.open('%src%', '_blank');');" },
  { "Open image": "bcEval('window.open('%src%', '_self');');" },
  { "Copy image URL": "bcEval(`navigator.clipboard.writeText('%src%');`);" },
  { "Download image": "bcEval('BcHelpers.downloadImage('%src%');');" },
  { "Copy image": "bcEval('BcHelpers.copyImage('%src%');');" },
];
var bc_defaultVideoMenuItems = [
  { "Open video in new tab": "bcEval('window.open('%src%', '_blank');');" },
  { "Open video": "bcEval('window.open('%src%', '_self');');" },
  { "Copy video URL": "bcEval('navigator.clipboard.writeText('%src%');');" },
  { "Download video": "bcEval('BcHelpers.downloadVideo('%src%');');" },
];
var bc_defaultLinkMenuItems = [
  { "Open link in new tab": "bcEval('window.open('%href%', '_blank');');" },
  { "Open link": "bcEval('window.open('%href%', '_self');');" },
  { "Copy link URL": "bcEval('navigator.clipboard.writeText('%href%');');" },
  { "Download link": "bcEval('BcHelpers.downloadLink('%href%');');" },
];

var bc_isContextMenuOpen = false;
let scrollPosition = 0;

var bc_h_windowWidth;
var bc_h_windowHeight;
var bc_h_menuWidth;
var bc_h_menuHeight;

document.addEventListener("DOMContentLoaded", function () {
  bc_contextMenu = document.getElementById("bc-contextMenu_main");
  bc_menuHead = document.getElementById("bc-menu-head_main");
  bc_h_updatePosData();
});

window.addEventListener("contextmenu", (e) => {
  // Check if the target element has a 'data-no-context-menu' attribute, or if one of its parents has the 'data-no-context-menu-children' attribute
  if (
    e.target.hasAttribute("data-no-context-menu") ||
    e.target.closest("[data-no-context-menu-children]")
  ) {
    bc_contextMenu.style.display = "none";
    bc_isContextMenuOpen = false;
    return;
  } else {
    bc_isContextMenuOpen = true;
  }
  e.preventDefault();

  bc_h_updatePosData();

  // Calculate the position of the menu
  let posX = e.clientX + window.scrollX;
  let posY = e.clientY + window.scrollY;

  // Check if the menu will go off the right side of the screen
  if (posX + bc_h_menuWidth > bc_h_windowWidth + window.scrollX) {
    posX -= bc_h_menuWidth;
  }

  // Check if the menu will go off the bottom of the screen
  if (posY + bc_h_menuHeight > bc_h_windowHeight + window.scrollY) {
    posY -= bc_h_menuHeight;
  }

  // Set the position of the menu
  bc_contextMenu.style.top = `${posY}px`;
  bc_contextMenu.style.left = `${posX}px`;

  // Check if the target element has a 'data-context-menu-name' attribute
  if (e.target.hasAttribute("data-context-menu-name")) {
    // Get the name of the menu
    const menuName = e.target.getAttribute("data-context-menu-name");
    // Set the title of the menu
    bc_menuHead.textContent = menuName;
  }
  // Check if the target element is a child of an element with a 'data-context-menu-name-children' attribute set to 'true'
  else if (e.target.closest("[data-context-menu-name-children=true]")) {
    // Get the name of the menu
    const menuName = e.target
      .closest("[data-context-menu-name-children=true]")
      .getAttribute("data-context-menu-name");
    // Set the title of the menu
    bc_menuHead.textContent = menuName;
  } else {
    // Set the title of the menu
    bc_menuHead.textContent = e.target.tagName;
  }

  // Display the menu
  bc_contextMenu.style.display = "flex";

  // Get the menu items
  var bc_menuItemContainer = document.getElementById("bc-menu-items_main");
  // Clear the menu items
  bc_menuItemContainer.innerHTML = "";

  // Define function parameters
  let funcParams = {
    eTarget: e.target,
    targetHTML: encodeURIComponent(e.target.outerHTML),
    targetSrc: encodeURIComponent(e.target.src),
    targetHref: encodeURIComponent(e.target.href),
    targetText: encodeURIComponent(e.target.textContent),
    targetTitle: encodeURIComponent(e.target.title),
    targetAlt: encodeURIComponent(e.target.alt),
    targetClass: encodeURIComponent(e.target.className),
    targetID: encodeURIComponent(e.target.id),
    targetStyle: encodeURIComponent(e.target.style.cssText),
    targetData: encodeURIComponent(e.target.dataset),
    targetSrcset: encodeURIComponent(e.target.srcset),
    targetWidth: encodeURIComponent(e.target.width),
    targetHeight: encodeURIComponent(e.target.height),
    targetType: encodeURIComponent(e.target.type),
    targetProtocol: encodeURIComponent(e.target.protocol),
    targetHost: encodeURIComponent(e.target.host),
    targetHostname: encodeURIComponent(e.target.hostname),
    targetPathname: encodeURIComponent(e.target.pathname),
    targetNodeName: encodeURIComponent(e.target.nodeName),
    targetRel: encodeURIComponent(e.target.rel),
    targetNodeParent: encodeURIComponent(e.target.parentNode),
    targetNodeParentHTML: encodeURIComponent(e.target.parentNode.outerHTML),
    menuName: bc_menuHead.textContent,
    menuItems: bc_menuItemContainer,
    menuPos: { x: posX, y: posY },
    menuWidth: bc_h_menuWidth,
    menuHeight: bc_h_menuHeight,
    windowWidth: bc_h_windowWidth,
    windowHeight: bc_h_windowHeight,
    e: e,
  };

  // Create the menu items depending on the target element
  if (e.target.closest("img")) {
    bc_menuItems = bc_defaultImageMenuItems;
  } else if (e.target.closest("video")) {
    bc_menuItems = bc_defaultVideoMenuItems;
  } else if (e.target.closest("a")) {
    bc_menuItems = bc_defaultLinkMenuItems;
  } else {
    bc_menuItems = bc_defaultMenuItems;
  }
  // Populate the menu with the menu items
  for (let i = 0; i < bc_menuItems.length; i++) {
    const menuItem = document.createElement("div");
    menuItem.classList.add("bc-menu-item");
    const actionText = Object.keys(bc_menuItems[i])[0];
    let action = bc_menuItems[i][actionText];

    // Parse the action for placeholders and replace them
    action = bc_h_parseMenuItemAction(action, e.target, {}, funcParams);

    // Check the syntax of the action

    try {
      new Function(action); // This will throw a SyntaxError if the code is invalid
    } catch (error) {
      if (error instanceof SyntaxError) {
        //console.error("Syntax error found:", error.message);
        action =
          "bcEval(`console.warn('Invalid action: " + error.message + "')`);";
      } else {
        //console.error("An error occurred:", error.message);
        action =
          "bcEval(`console.warn('An error occurred: " + error.message + "')`);";
      }
    }

    menuItem.textContent = actionText;
    menuItem.setAttribute("onclick", action);
    bc_menuItemContainer.appendChild(menuItem);
  }
});

window.addEventListener("click", (event) => {
  // Check if the target element is not the menu
  if (!bc_contextMenu.contains(event.target)) {
    bc_isContextMenuOpen = false;
    bc_contextMenu.style.display = "none";
  }
});

function bc_h_updatePosData() {
  const dimensions = bc_cloneAndGetDimensions(bc_contextMenu);
  // Get the size of the window
  bc_h_windowWidth = window.innerWidth;
  bc_h_windowHeight = window.innerHeight;

  // Get the size of the menu
  bc_h_menuWidth = dimensions.width; //bc_contextMenu.offsetWidth;
  bc_h_menuHeight = dimensions.height; //bc_contextMenu.offsetHeight;
}

function bc_h_parseMenuItemAction(
  action,
  targetElement,
  localVariables = {},
  functionParameters = {}
) {
  // Replace target element attribute placeholders (%attribute%)
  action = action.replace(/%([^%]+)%/g, (match, attributeName) => {
    return targetElement.getAttribute(attributeName) || "";
  });

  // Replace local variable placeholders (*localVariable*)
  action = action.replace(/\*([a-zA-Z_][a-zA-Z0-9_]*)\*/g, (match, varName) => {
    return localVariables.hasOwnProperty(varName)
      ? localVariables[varName]
      : "";
  });

  // Replace function parameter placeholders ($parameter$)
  action = action.replace(
    /\$([a-zA-Z_][a-zA-Z0-9_]*)\$/g,
    (match, paramName) => {
      return functionParameters.hasOwnProperty(paramName)
        ? functionParameters[paramName]
        : "";
    }
  );

  return action;
}

function bc_cloneAndGetDimensions(element) {
  // Clone the element
  const clone = element.cloneNode(true);

  // Apply necessary styles to the clone
  clone.style.visibility = "hidden"; // Make it invisible
  clone.style.position = "absolute"; // Take it out of the document flow
  clone.style.display = "block"; // Make it a block element

  // Append the clone to the body
  document.body.appendChild(clone);

  // Calculate the dimensions
  const dimensions = {
    width: clone.offsetWidth,
    height: clone.offsetHeight,
  };

  // Remove the clone from the body
  document.body.removeChild(clone);

  return dimensions;
}

function bcEval(code) {
  bc_contextMenu.style.display = "none";
  bc_isContextMenuOpen = false;
  try {
    return eval(code);
  } catch (error) {
    console.error(error);
  }
}

const BcHelpers = {
  downloadImage(src) {
    fetch(src)
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.style.display = "none";
        link.href = url;
        link.download = src.substring(src.lastIndexOf("/") + 1);
        document.body.appendChild(link);
        link.click();
        window.URL.revokeObjectURL(url);
        link.remove();
      })
      .catch((e) => console.error("Download failed:", e));
  },
  async copyImage(src) {
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const pngBlob = await this.convertToPNG(blob); // Convert to PNG Blob
      await navigator.clipboard.write([
        new ClipboardItem({
          "image/png": pngBlob,
        }),
      ]);
      //console.log("Image copied to clipboard");
    } catch (error) {
      console.error("Could not copy image to clipboard:", error);
    }
  },
  async convertToPNG(blob) {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(resolve, "image/png");
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(blob);
    });
  },
  downloadVideo(src) {
    fetch(src)
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.style.display = "none";
        link.href = url;
        link.download = src.substring(src.lastIndexOf("/") + 1);
        document.body.appendChild(link);
        link.click();
        window.URL.revokeObjectURL(url);
        link.remove();
      });
  },
  downloadAudio(src) {
    fetch(src)
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.style.display = "none";
        link.href = url;
        link.download = src.substring(src.lastIndexOf("/") + 1);
        document.body.appendChild(link);
        link.click();
        window.URL.revokeObjectURL(url);
        link.remove();
      });
  },
  downloadLink(src) {
    fetch(src)
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.style.display = "none";
        link.href = url;
        link.download = src.substring(src.lastIndexOf("/") + 1);
        document.body.appendChild(link);
        link.click();
        window.URL.revokeObjectURL(url);
        link.remove();
      });
  },
  printElement(html) {
    var printWindow = window.open("", "", "width=800,height=600");
    printWindow.document.write(`${decodeURIComponent(html)}`);
    printWindow.document.close(); // necessary for IE >= 10
    printWindow.focus(); // necessary for IE >= 10
    printWindow.print();
  },
};

#! /usr/bin/env python
# -*- coding: utf-8 -*-
# S.D.G

"""Doc string for module



:author: Ben Johnston
:license: 3-Clause BSD

"""

# Imports
import os
import unittest
import json
from selenium.webdriver import Firefox
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains

PARDIR = os.path.abspath(os.path.join(os.path.dirname(__file__), os.pardir))
INDEX = f"file://{PARDIR}/index.html"

def getSample(browser, config):
    """Get the sample from the browser"""

    # Refresh the page
    browser.get(INDEX)
    # Load the test config file
    browser.execute_script("manager.init('./test/config.json')")
    canvasbg = browser.find_element_by_id("canvasbg")

    # Get the current image loaded into the canvas
    img = os.path.basename(canvasbg.get_property("src"))

    # Get the sample from the config file
    for samp in config['samples']:

        # The sample has been found
        if config['samples'][samp]['image'] == img:
            return config['samples'][samp]


class TestLandmarks(unittest.TestCase):

    def setUp(self):
        self.browser = Firefox()
        with open(os.path.join(PARDIR, 'static', 'config.json'), 'r') as f:
            self.config = json.load(f)

    def testNextImageHidden(self):
        """Test the next image button is hidden by default"""

        # Refresh the page
        self.browser.get(INDEX)
        # Load the test config file
        self.browser.execute_script("manager.init('./test/config.json')")

        next_image = self.browser.find_element_by_id("nextButton")
        self.assertEqual(next_image.get_attribute("style"),
            "visibility: hidden;")

    def testSelectValidPoints(self):
        """Test the system can identify correctly selected valid points"""

        sample = getSample(self.browser, self.config)
        canvasbg = self.browser.find_element_by_id("canvasbg")

        toolbox = self.browser.find_element_by_id("toolbox")
        # Construct the action chain for selecting the coordinates on the canvas
        for idx in sample['landmarks']:
            landmark = sample['landmarks'][idx]
            actions = ActionChains(self.browser)
            tool = toolbox.find_element_by_id(f"label_{idx}")

            # Select tool
            actions.click(tool)
            actions.move_to_element_with_offset(canvasbg, float(landmark['x']), float(landmark['y']))
            actions.click()
            actions.perform()

        # Wait until the button is showing
        WebDriverWait(self.browser, 10).until(
            EC.visibility_of_element_located((By.ID, "nextButton")))

    def testInvalidPoints(self):
        """Test invalid selections show the warning and not the next image button"""

        sample = getSample(self.browser, self.config)
        canvasbg = self.browser.find_element_by_id("canvasbg")
        width = canvasbg.get_property("width") 
        height = canvasbg.get_property("height") 

        toolbox = self.browser.find_element_by_id("toolbox")
        indices = []
        # Construct the action chain for selecting the coordinates on the canvas
        for idx in sample['landmarks']:
            indices.append(idx)
            landmark = sample['landmarks'][idx]
            actions = ActionChains(self.browser)
            tool = toolbox.find_element_by_id(f"label_{idx}")

            # Select tool
            actions.click(tool)
            actions.move_to_element_with_offset(canvasbg,
                width - float(landmark['x']),
                height - float(landmark['y']))
            actions.click()
            actions.perform()

        warning_msg = self.browser.find_element_by_id("check-warning-message")
        # Check the two landmarks are described in the warning message
        for idx in indices:
            self.assertTrue(warning_msg.text.find(idx) >= 0, f"{idx} warning not found")

        next_image = self.browser.find_element_by_id("nextButton")
        self.assertEqual(next_image.get_attribute("style"),
            "visibility: hidden;")

    def tearDown(self):
        self.browser.close()

class TestSamples(unittest.TestCase):

    def setUp(self):
        self.browser = Firefox()
        with open(os.path.join(PARDIR, 'static', 'config.json'), 'r') as f:
            self.config = json.load(f)

    def selectNextSample(self):
        """Test the system correctly loads the next sample"""

        sample = getSample(self.browser, self.config)
        canvasbg = self.browser.find_element_by_id("canvasbg")
        currImage = canvasbg.get_attribute("src")

        toolbox = self.browser.find_element_by_id("toolbox")
        # Construct the action chain for selecting the coordinates on the canvas
        for idx in sample['landmarks']:
            landmark = sample['landmarks'][idx]
            actions = ActionChains(self.browser)
            tool = toolbox.find_element_by_id(f"label_{idx}")

            # Select tool
            actions.click(tool)
            actions.move_to_element_with_offset(canvasbg, float(landmark['x']), float(landmark['y']))
            actions.click()
            actions.perform()

        # Wait until the button is showing
        WebDriverWait(self.browser, 10).until(
            EC.visibility_of_element_located((By.ID, "nextButton")))

        self.browser.find_element_by_id("nextButton").click()

        # Check the src of the background image, it should be the next sample in the set 
        self.assertNotEqual(currImage, canvasbg.get_attribute("src"))

    def tearDown(self):
        self.browser.close()


